import type { Grid, PositionSlice, WindowSlice } from '@speedytables/core';

export type RowData = Record<string, unknown>;

/**
 * Runes adapter: maps the core's per-slice subscriptions onto $state.
 * Payloads are window-sized ($state.raw — never proxy row data; see AGENTS.md).
 */
export class GridView {
	readonly grid: Grid<RowData>;
	window = $state.raw<WindowSlice<RowData>>({ firstRow: 0, count: 0, rows: [] });
	position = $state.raw<PositionSlice>({ blockTop: 0, virtualHeight: 0 });
	/** Horizontal scroll offset, for header sync. Purely a render concern. */
	scrollLeft = $state(0);

	#unsubscribe: (() => void)[];

	constructor(grid: Grid<RowData>) {
		this.grid = grid;
		this.window = grid.window;
		this.position = grid.position;
		this.#unsubscribe = [
			grid.subscribe('window', () => (this.window = grid.window)),
			grid.subscribe('position', () => (this.position = grid.position))
		];
	}

	get totalWidth(): number {
		return this.grid.columns.reduce((sum, col) => sum + (col.width ?? 150), 0);
	}

	destroy(): void {
		for (const unsubscribe of this.#unsubscribe) unsubscribe();
	}
}
