export interface ColumnDef {
	id: string;
	header?: string;
	/** Pixel width. Fixed in M1; resize/reorder land in M6. */
	width?: number;
	/** Render-layer formatter. The core never calls this. */
	format?: (value: unknown) => string;
}

export interface GridConfig<Row> {
	columns: ColumnDef[];
	/** Stable row identity — deltas and incremental patches key on it (ADR-0004). */
	getRowId: (row: Row) => string;
	data?: Row[];
	/** Fixed pixel row height (v1 constraint). Default 32. */
	rowHeight?: number;
	/** Extra rows rendered above/below the visible window. Default 3. */
	overscan?: number;
}

/** The contiguous slice of pipeline output currently materialized for rendering. */
export interface WindowSlice<Row> {
	firstRow: number;
	count: number;
	rows: Row[];
}

/** Where to place the rendered window, and how big the scroll canvas is. */
export interface PositionSlice {
	/** translateY for the row block, in canvas px. */
	blockTop: number;
	/** Height of the scroll canvas (capped — see viewport.ts). */
	virtualHeight: number;
}

export type Slice = 'window' | 'position';
