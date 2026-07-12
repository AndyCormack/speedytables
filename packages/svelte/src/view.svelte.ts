import type { Grid, PositionSlice, SortSpec, WindowSlice } from '@speedytables/core';

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
	/** Horizontal scroll offset, for header sync. Purely a render concern. */
	scrollLeft = $state(0);

	#unsubscribe: (() => void)[];

	constructor(grid: Grid<RowData>) {
		this.grid = grid;
		this.window = grid.window;
		this.position = grid.position;
		this.#unsubscribe = [
			grid.subscribe('window', () => (this.window = grid.window)),
			grid.subscribe('position', () => (this.position = grid.position)),
			grid.subscribe('sortModel', () => (this.sortModel = grid.sortModel))
		];
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
		return this.grid.columns.reduce((sum, col) => sum + (col.width ?? 150), 0);
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribe) unsubscribe();
	}
}
