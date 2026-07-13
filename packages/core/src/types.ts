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
	| { columnId: string; type: 'in'; values: string[] } // enum/set membership (exact)
	| { columnId: string; type: 'range'; min?: number; max?: number }; // number/date bounds, inclusive

export interface ColumnDef {
	id: string;
	header?: string;
	/** Drives sort-key projection: number/date project to Float64Array. Default 'text'. */
	dataType?: DataType;
	/** Which filter UI a filter row renders for this column. Defaults by dataType: number → 'range', date → 'none', text → 'text'. */
	filter?: 'text' | 'enum' | 'range' | 'none';
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
	/**
	 * Where declarative rebuilds run. 'worker': filter + sort on a web worker
	 * mirror (main thread idle; text columns pay a one-time clone into the
	 * worker). 'hybrid': filter on the time-sliced main thread (projections and
	 * the typeahead refinement cache stay local), sort on the worker fed by the
	 * filter's candidate indices — usually the best of both, and the smallest
	 * worker heap (only sorted columns are mirrored). Both fall back to
	 * 'main-thread' where Workers don't exist (SSR, tests). Deltas always patch
	 * on the main thread.
	 */
	compute?: 'main-thread' | 'worker' | 'hybrid';
}

/**
 * An explicit batch of row mutations, keyed by row id (ADR-0004). Batches
 * applied within one animation frame coalesce into a single pipeline patch.
 */
export interface Delta<Row> {
	insert?: Row[];
	/** Full replacement rows, matched to existing rows via getRowId. */
	update?: Row[];
	/** Row ids to remove. */
	remove?: string[];
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
