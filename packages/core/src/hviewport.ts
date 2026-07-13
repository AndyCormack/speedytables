/**
 * Horizontal window math: scroll position → which columns to render, and where.
 * Columns have variable widths (unlike fixed-height rows), so this walks the
 * width list directly — column counts are small (≤ ~1000), a linear scan is
 * cheaper than maintaining a prefix-sum structure.
 */

export interface HWindow {
	firstCol: number;
	count: number;
	/** translateX for the windowed cell block, in canvas px. */
	offsetX: number;
	totalWidth: number;
}

export function computeHWindow(
	scrollLeft: number,
	viewportWidth: number,
	widths: number[],
	overscan = 2
): HWindow {
	let totalWidth = 0;
	for (const w of widths) totalWidth += w;

	const maxScroll = Math.max(0, totalWidth - viewportWidth);
	const left = Math.min(Math.max(scrollLeft, 0), maxScroll);
	const right = left + viewportWidth;

	let x = 0;
	let firstCol = 0;
	let offsetX = 0;
	// first column whose right edge crosses the viewport's left edge
	while (firstCol < widths.length && x + widths[firstCol]! <= left) {
		x += widths[firstCol]!;
		firstCol++;
	}
	offsetX = x;

	let count = 0;
	while (firstCol + count < widths.length && x < right) {
		x += widths[firstCol + count]!;
		count++;
	}
	count = Math.max(count, Math.min(1, widths.length)); // always at least one column when any exist

	// overscan on both sides
	const lead = Math.min(overscan, firstCol);
	for (let i = 1; i <= lead; i++) offsetX -= widths[firstCol - i]!;
	firstCol -= lead;
	count = Math.min(count + lead + overscan, widths.length - firstCol);

	return { firstCol, count, offsetX, totalWidth };
}
