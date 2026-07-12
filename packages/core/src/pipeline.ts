import type { Job } from './executor';
import { filterIndicesJob, narrows } from './filter';
import { buildProjection, type Projection } from './projection';
import type { ColumnDef, FilterSpec } from './types';

const YIELD_MASK = 0xffff;

/**
 * Row pipeline: source → filter → sort → window (ADR-0001).
 * Filter and sort are index indirections over the source; each stage's output
 * is cached and invalidated independently. The Grid only ever reads through
 * this seam.
 */
export class RowPipeline<Row> {
	#source: Row[] = [];
	#identity: Uint32Array | null = null;
	#projections = new Map<string, Projection>();
	#lower = new Map<string, string[]>();

	#filterCache: { model: FilterSpec[]; result: Uint32Array } | null = null;
	#filtered: Uint32Array | null = null;
	#sorted: Uint32Array | null = null;
	#predicate: ((sourceIndex: number) => boolean) | null = null;
	#idIndex: Map<string, number> | null = null;

	setSource(rows: Row[]): void {
		// shallow copy: deltas patch the source in place, and that must never
		// reach back into the consumer's array
		this.#source = rows.slice();
		this.#identity = null;
		this.#projections.clear();
		this.#lower.clear();
		this.#filterCache = null;
		this.#filtered = null;
		this.#sorted = null;
		this.#predicate = null;
		this.#idIndex = null;
	}

	/** Lazy id → source-index map, built as a sliceable job (O(N) once per source). */
	*idIndexJob(getRowId: (row: Row) => string): Job<Map<string, number>> {
		if (this.#idIndex) return this.#idIndex;
		const map = new Map<string, number>();
		for (let i = 0; i < this.#source.length; i++) {
			map.set(getRowId(this.#source[i]!), i);
			if ((i & YIELD_MASK) === 0) yield;
		}
		this.#idIndex = map;
		return map;
	}

	/** Append rows (insert path). Callers must follow with a full rebuild. */
	appendRows(rows: Row[], getRowId: (row: Row) => string): void {
		const base = this.#source.length;
		this.#source.push(...rows);
		this.#invalidateStages();
		if (this.#idIndex) {
			for (let i = 0; i < rows.length; i++) this.#idIndex.set(getRowId(rows[i]!), base + i);
		}
	}

	/** Remove rows by id (remove path). Callers must follow with a full rebuild. */
	removeByIds(ids: string[], getRowId: (row: Row) => string): void {
		const gone = new Set(ids);
		this.#source = this.#source.filter((row) => !gone.has(getRowId(row)));
		this.#invalidateStages();
		this.#idIndex = null; // indices shifted
	}

	/** Structural source change: every stage cache holds stale source indices. */
	#invalidateStages(): void {
		this.#identity = null;
		this.#projections.clear();
		this.#lower.clear();
		this.#filterCache = null;
		this.#filtered = null;
		this.#sorted = null;
		this.#predicate = null;
	}

	/** Cached columnar projection for a column; built lazily as a sliceable job. */
	*projectionJob(column: ColumnDef): Job<Projection> {
		const cached = this.#projections.get(column.id);
		if (cached) return cached;
		const projection = yield* buildProjection(this.#source, column);
		this.#projections.set(column.id, projection);
		return projection;
	}

	/** Lowercased text projection, for case-insensitive contains. */
	*lowerProjectionJob(column: ColumnDef): Job<string[]> {
		const cached = this.#lower.get(column.id);
		if (cached) return cached;
		const projection = (yield* this.projectionJob(column)) as string[];
		const lower = new Array<string>(projection.length);
		for (let i = 0; i < projection.length; i++) {
			lower[i] = projection[i]!.toLowerCase();
			if ((i & YIELD_MASK) === 0) yield;
		}
		this.#lower.set(column.id, lower);
		return lower;
	}

	*identityJob(): Job<Uint32Array> {
		if (this.#identity) return this.#identity;
		const identity = new Uint32Array(this.#source.length);
		for (let i = 0; i < identity.length; i++) {
			identity[i] = i;
			if ((i & YIELD_MASK) === 0) yield;
		}
		this.#identity = identity;
		return identity;
	}

	/**
	 * Runs the filter stage for `model`, updating this pipeline's filtered set.
	 * When the new model provably narrows the previous one (typeahead), only the
	 * previous matches are re-scanned instead of the full source.
	 */
	*filterJob(model: FilterSpec[], columns: ColumnDef[]): Job<void> {
		if (model.length === 0) {
			this.#filtered = null;
			this.#filterCache = null;
			this.#predicate = null;
			return;
		}

		const tests: ((sourceIndex: number) => boolean)[] = [];
		for (const spec of model) {
			const column = columns.find((c) => c.id === spec.columnId);
			if (!column) throw new Error(`Unknown filter column: ${spec.columnId}`);
			if (spec.type === 'contains') {
				const lower = yield* this.lowerProjectionJob(column);
				const needle = spec.value.toLowerCase();
				tests.push((i) => lower[i]!.includes(needle));
			} else if (spec.type === 'range') {
				const projection = (yield* this.projectionJob(column)) as Float64Array;
				const min = spec.min ?? -Infinity;
				const max = spec.max ?? Infinity;
				tests.push((i) => {
					const value = projection[i]!;
					return value >= min && value <= max; // NaN (null) never passes
				});
			} else {
				const projection = (yield* this.projectionJob(column)) as string[];
				const allowed = new Set(spec.values);
				tests.push((i) => allowed.has(projection[i]!));
			}
		}
		const predicate = (i: number): boolean => {
			for (const test of tests) if (!test(i)) return false;
			return true;
		};

		const refinable = this.#filterCache && narrows(this.#filterCache.model, model);
		const candidates = refinable ? this.#filterCache!.result : yield* this.identityJob();
		const result = yield* filterIndicesJob(candidates, predicate);
		this.#filterCache = { model, result };
		this.#filtered = result;
		this.#predicate = predicate; // kept for the incremental patch path
	}

	/**
	 * Incremental update path (ADR-0004): apply replacement rows in place —
	 * patch cached projections, re-evaluate filter membership, and re-position
	 * changed rows in the sorted/filtered index arrays via one merge pass each.
	 * O(output + k log k) per flush with memcpy-grade constants; never a full
	 * pipeline recompute.
	 */
	patch(
		entries: { index: number; row: Row }[],
		columns: ColumnDef[],
		comparator: ((a: number, b: number) => number) | null
	): void {
		const predicate = this.#predicate;
		const patchSorted = this.#sorted !== null && comparator !== null;

		const sortRemovals = new Set<number>();
		const sortInserts: number[] = [];
		const filterRemovals = new Set<number>();
		const filterInserts: number[] = [];

		for (const { index, row } of entries) {
			const wasIn = predicate ? predicate(index) : true;
			this.#source[index] = row;
			for (const column of columns) this.#patchProjection(column, index, row);
			const isIn = predicate ? predicate(index) : true;

			if (patchSorted) {
				if (wasIn) sortRemovals.add(index);
				if (isIn) sortInserts.push(index);
			}
			if (this.#filtered) {
				if (wasIn && !isIn) filterRemovals.add(index);
				else if (!wasIn && isIn) filterInserts.push(index);
			}
		}

		if (this.#filtered && (filterRemovals.size > 0 || filterInserts.length > 0)) {
			filterInserts.sort((a, b) => a - b);
			this.#filtered = mergePatch(this.#filtered, filterRemovals, filterInserts, (a, b) => a - b);
			if (this.#filterCache) this.#filterCache.result = this.#filtered;
		}
		if (patchSorted) {
			sortInserts.sort(comparator!);
			this.#sorted = mergePatch(this.#sorted!, sortRemovals, sortInserts, comparator!);
		}
	}

	#patchProjection(column: ColumnDef, index: number, row: Row): void {
		const projection = this.#projections.get(column.id);
		if (!projection) return;
		const value = (row as Record<string, unknown>)[column.id];
		if (Array.isArray(projection)) {
			const text = value == null ? '' : String(value);
			projection[index] = text;
			const lower = this.#lower.get(column.id);
			if (lower) lower[index] = text.toLowerCase();
		} else {
			projection[index] = value == null ? NaN : Number(value);
		}
	}

	/** Candidate indices for the sort stage: the filtered set, or all rows. */
	*candidatesJob(): Job<Uint32Array> {
		return this.#filtered ?? (yield* this.identityJob());
	}

	setSortedIndex(index: Uint32Array | null): void {
		this.#sorted = index;
	}

	/** Number of rows the pipeline currently outputs (post-filter). */
	get length(): number {
		return (this.#sorted ?? this.#filtered)?.length ?? this.#source.length;
	}

	/** Rows [start, start + count) of pipeline output. */
	window(start: number, count: number): Row[] {
		const index = this.#sorted ?? this.#filtered;
		if (!index) return this.#source.slice(start, start + count);
		const out = new Array<Row>(Math.max(0, count));
		for (let i = 0; i < count; i++) out[i] = this.#source[index[start + i]!]!;
		return out;
	}
}

/**
 * One pass: copy `current` skipping `removals`, merging `inserts` (pre-sorted
 * by `compare`) at their ordered positions. All removals must be present in
 * `current`; the comparator is a total order, so positions are exact.
 */
function mergePatch(
	current: Uint32Array,
	removals: Set<number>,
	inserts: number[],
	compare: (a: number, b: number) => number
): Uint32Array {
	const out = new Uint32Array(current.length - removals.size + inserts.length);
	let outAt = 0;
	let insertAt = 0;
	for (let i = 0; i < current.length; i++) {
		const index = current[i]!;
		if (removals.has(index)) continue;
		while (insertAt < inserts.length && compare(inserts[insertAt]!, index) < 0) {
			out[outAt++] = inserts[insertAt++]!;
		}
		out[outAt++] = index;
	}
	while (insertAt < inserts.length) out[outAt++] = inserts[insertAt++]!;
	return out;
}
