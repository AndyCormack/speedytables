import type { Job } from './executor';
import { buildProjection, type Projection } from './projection';
import type { ColumnDef } from './types';

/**
 * Row pipeline: source → filter → sort → window (ADR-0001).
 * M2 adds the sort stage as an index indirection over the source; filter (M3)
 * will compose the same way. The Grid only ever reads through this seam.
 */
export class RowPipeline<Row> {
	#source: Row[] = [];
	#sorted: Uint32Array | null = null;
	#projections = new Map<string, Projection>();

	setSource(rows: Row[]): void {
		this.#source = rows;
		this.#sorted = null;
		this.#projections.clear();
	}

	setSortedIndex(index: Uint32Array | null): void {
		this.#sorted = index;
	}

	/** Cached columnar projection for a column; built lazily as a sliceable job. */
	*projectionJob(column: ColumnDef): Job<Projection> {
		const cached = this.#projections.get(column.id);
		if (cached) return cached;
		const projection = yield* buildProjection(this.#source, column);
		this.#projections.set(column.id, projection);
		return projection;
	}

	get length(): number {
		return this.#source.length;
	}

	/** Rows [start, start + count) of pipeline output. */
	window(start: number, count: number): Row[] {
		if (!this.#sorted) return this.#source.slice(start, start + count);
		const out = new Array<Row>(Math.max(0, count));
		for (let i = 0; i < count; i++) out[i] = this.#source[this.#sorted[start + i]!]!;
		return out;
	}
}
