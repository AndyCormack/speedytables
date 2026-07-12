/**
 * Row pipeline shell: source → filter → sort → window (ADR-0001).
 * M1 ships only the source stage; filter (M3) and sort (M2) will introduce an
 * index indirection here. The Grid only ever reads through this seam, so adding
 * stages later cannot touch rendering code.
 */
export class RowPipeline<Row> {
	#source: Row[] = [];

	setSource(rows: Row[]): void {
		this.#source = rows;
	}

	get length(): number {
		return this.#source.length;
	}

	/** Rows [start, start + count) of pipeline output. */
	window(start: number, count: number): Row[] {
		return this.#source.slice(start, start + count);
	}
}
