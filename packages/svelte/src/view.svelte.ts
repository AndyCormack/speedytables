import type {
	ColumnsSlice,
	FilterSpec,
	Grid,
	HWindowSlice,
	PositionSlice,
	SortSpec,
	WindowSlice
} from '@speedytables/core';

export type RowData = Record<string, unknown>;

/**
 * Runes adapter: maps the core's per-slice subscriptions onto $state.
 * Payloads are window-sized ($state.raw — never proxy row data; see AGENTS.md).
 */
export class GridView {
	readonly grid: Grid<RowData>;
	window = $state.raw<WindowSlice<RowData>>({ firstRow: 0, count: 0, rows: [] });
	position = $state.raw<PositionSlice>({ blockTop: 0, virtualHeight: 0 });
	sortModel = $state.raw<SortSpec[]>([]);
	filterModel = $state.raw<FilterSpec[]>([]);
	columns = $state.raw<ColumnsSlice>({ columns: [], totalWidth: 0 });
	hwindow = $state.raw<HWindowSlice>({ firstCol: 0, columns: [], offsetX: 0, totalWidth: 0 });
	/** Horizontal scroll offset, for header sync. Purely a render concern. */
	scrollLeft = $state(0);

	#unsubscribe: (() => void)[];

	constructor(grid: Grid<RowData>) {
		this.grid = grid;
		this.window = grid.window;
		this.position = grid.position;
		this.columns = grid.visibleColumns;
		this.hwindow = grid.hwindow;
		this.#unsubscribe = [
			grid.subscribe('window', () => (this.window = grid.window)),
			grid.subscribe('position', () => (this.position = grid.position)),
			grid.subscribe('sortModel', () => (this.sortModel = grid.sortModel)),
			grid.subscribe('filterModel', () => (this.filterModel = grid.filterModel)),
			grid.subscribe('columns', () => (this.columns = grid.visibleColumns)),
			grid.subscribe('hwindow', () => (this.hwindow = grid.hwindow))
		];
	}

	get hiddenCount(): number {
		return this.grid.columns.length - this.columns.columns.length;
	}

	setColumnWidth(columnId: string, px: number): void {
		this.grid.setColumnWidth(columnId, px);
	}

	moveColumn(columnId: string, beforeColumnId: string | null): void {
		this.grid.moveColumn(columnId, beforeColumnId);
	}

	setColumnVisible(columnId: string, visible: boolean): void {
		this.grid.setColumnVisible(columnId, visible);
	}

	showAllColumns(): void {
		this.grid.showAllColumns();
	}

	/** Current contains-filter text for a column ('' when none). */
	containsValue(columnId: string): string {
		const spec = this.filterModel.find((s) => s.columnId === columnId);
		return spec?.type === 'contains' ? spec.value : '';
	}

	/** Current enum-filter selection for a column (null when none). */
	inValues(columnId: string): string[] | null {
		const spec = this.filterModel.find((s) => s.columnId === columnId);
		return spec?.type === 'in' ? spec.values : null;
	}

	setContains(columnId: string, text: string): void {
		const others = this.filterModel.filter((s) => s.columnId !== columnId);
		void this.grid.setFilterModel(
			text === '' ? others : [...others, { columnId, type: 'contains', value: text }]
		);
	}

	setIn(columnId: string, values: string[] | null): void {
		const others = this.filterModel.filter((s) => s.columnId !== columnId);
		void this.grid.setFilterModel(
			values === null || values.length === 0 ? others : [...others, { columnId, type: 'in', values }]
		);
	}

	/** Current range-filter bounds for a column (null when none). */
	rangeValue(columnId: string): { min?: number; max?: number } | null {
		const spec = this.filterModel.find((s) => s.columnId === columnId);
		return spec?.type === 'range' ? spec : null;
	}

	setRange(columnId: string, min: number | undefined, max: number | undefined): void {
		const others = this.filterModel.filter((s) => s.columnId !== columnId);
		if (min === undefined && max === undefined) {
			void this.grid.setFilterModel(others);
			return;
		}
		void this.grid.setFilterModel([
			...others,
			{ columnId, type: 'range', ...(min !== undefined && { min }), ...(max !== undefined && { max }) }
		]);
	}

	sortDirection(columnId: string): 'asc' | 'desc' | undefined {
		return this.sortModel.find((s) => s.columnId === columnId)?.dir;
	}

	/** Header-click behavior: cycle none → asc → desc → none on a single column. */
	toggleSort(columnId: string): void {
		const current = this.sortDirection(columnId);
		const next: SortSpec[] =
			current === undefined
				? [{ columnId, dir: 'asc' }]
				: current === 'asc'
					? [{ columnId, dir: 'desc' }]
					: [];
		void this.grid.setSortModel(next);
	}

	get totalWidth(): number {
		return this.columns.totalWidth;
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribe) unsubscribe();
	}
}
