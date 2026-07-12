export type DataType = 'text' | 'number' | 'date';
export type SortDirection = 'asc' | 'desc';

/** Declarative sort descriptor (ADR-0002) — serializable, worker-eligible. */
export interface SortSpec {
	columnId: string;
	dir: SortDirection;
}

/** Declarative filter descriptors (ADR-0002) — serializable, worker-eligible. Specs AND together. */
export type FilterSpec =
	| { columnId: string; type: 'contains'; value: string } // case-insensitive text
	| { columnId: string; type: 'in'; values: string[] }; // enum/set membership (exact)

export interface ColumnDef {
	id: string;
	header?: string;
	/** Drives sort-key projection: number/date project to Float64Array. Default 'text'. */
	dataType?: DataType;
	/** Which filter UI a filter row renders for this column. Default 'text' (contains). */
	filter?: 'text' | 'enum' | 'none';
	/** Options for the 'enum' filter UI. The core never reads this. */
	filterValues?: string[];
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
	/** Where pipeline compute runs (ADR-0002). Default: time-sliced main thread. */
	executor?: import('./executor').Executor;
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

export type Slice = 'window' | 'position' | 'sortModel' | 'filterModel';
