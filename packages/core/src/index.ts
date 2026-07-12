// @speedytables/core — pipeline, viewport math, per-slice subscriptions.
// Plain TS only: no Svelte, no DOM assumptions on the hot path (worker must run it all).

export { createGrid, Grid } from './grid';
export { computeWindow, virtualHeight, MAX_CANVAS_PX } from './viewport';
export type { ViewportInput, ViewportWindow } from './viewport';
export type { ColumnDef, GridConfig, PositionSlice, Slice, WindowSlice } from './types';
