// @speedytables/core — pipeline, viewport math, per-slice subscriptions.
// Plain TS only: no Svelte, no DOM assumptions on the hot path (worker must run it all).

export { createGrid, Grid } from './grid';
export { MainThreadExecutor } from './executor';
export type { Executor, Job } from './executor';
export { computeWindow, virtualHeight, MAX_CANVAS_PX } from './viewport';
export type { ViewportInput, ViewportWindow } from './viewport';
export type {
	ColumnDef,
	DataType,
	GridConfig,
	PositionSlice,
	Slice,
	SortDirection,
	SortSpec,
	WindowSlice
} from './types';
