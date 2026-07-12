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

	setSource(rows: Row[]): void {
		this.#source = rows;
		this.#identity = null;
		this.#projections.clear();
		this.#lower.clear();
		this.#filterCache = null;
		this.#filtered = null;
		this.#sorted = null;
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
