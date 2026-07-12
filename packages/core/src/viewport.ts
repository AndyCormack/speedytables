/**
 * Window math: scroll position → which rows to render, and where.
 *
 * The scroll canvas height is CAPPED, never rowCount × rowHeight. Browsers clamp
 * element heights silently (Chromium ~33.55M px, Firefox ~17.9M px); 1M rows × 32px
 * is already past Firefox's cap. Below the cap, scrollTop maps 1:1 to row offsets;
 * above it, scrollTop maps proportionally onto the row range. Both cases reduce to
 * the same formula via `exactRow` (the fractional row index at the viewport top).
 */

export const MAX_CANVAS_PX = 8_000_000;

export interface ViewportInput {
	scrollTop: number;
	viewportHeight: number;
	rowHeight: number;
	rowCount: number;
	overscan: number;
}

export interface ViewportWindow {
	firstRow: number;
	count: number;
	blockTop: number;
	virtualHeight: number;
}

export function virtualHeight(rowCount: number, rowHeight: number): number {
	return Math.min(rowCount * rowHeight, MAX_CANVAS_PX);
}

export function computeWindow(input: ViewportInput): ViewportWindow {
	const { viewportHeight, rowHeight, rowCount, overscan } = input;
	const contentHeight = rowCount * rowHeight;
	const canvas = virtualHeight(rowCount, rowHeight);
	const maxScroll = Math.max(0, canvas - viewportHeight);
	const scrollTop = clamp(input.scrollTop, 0, maxScroll);

	// Fractional row index at the top of the viewport.
	const exactRow =
		maxScroll === 0
			? 0
			: contentHeight <= canvas
				? scrollTop / rowHeight
				: (scrollTop / maxScroll) * (rowCount - viewportHeight / rowHeight);

	const topRow = Math.floor(exactRow);
	const overscanUsed = Math.min(overscan, topRow);
	const firstRow = topRow - overscanUsed;
	const visible = Math.ceil(viewportHeight / rowHeight) + 1;
	const count = Math.min(visible + overscan + overscanUsed, rowCount - firstRow);

	// Anchor the block so the exact fractional row sits at the viewport top.
	// Uncompressed this reduces to firstRow × rowHeight (static per row step).
	const blockTop = scrollTop - (exactRow - topRow) * rowHeight - overscanUsed * rowHeight;

	return { firstRow, count: Math.max(0, count), blockTop, virtualHeight: canvas };
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
