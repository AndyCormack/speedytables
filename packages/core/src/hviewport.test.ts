import { describe, expect, it } from 'vitest';
import { computeHWindow } from './hviewport';
import { createGrid } from './grid';

describe('computeHWindow', () => {
	const widths = Array.from({ length: 150 }, () => 150); // wide-grid shape

	it('windows the visible columns plus overscan at rest', () => {
		const w = computeHWindow(0, 900, widths);
		expect(w.firstCol).toBe(0);
		expect(w.count).toBe(6 + 2); // 900/150 visible + trailing overscan
		expect(w.offsetX).toBe(0);
		expect(w.totalWidth).toBe(150 * 150);
	});

	it('scrolled window starts at the right column with the right offset', () => {
		const w = computeHWindow(1500, 900, widths); // exactly col 10
		expect(w.firstCol).toBe(10 - 2); // leading overscan
		expect(w.offsetX).toBe((10 - 2) * 150);
		expect(w.firstCol + w.count).toBeGreaterThanOrEqual(10 + 6);
	});

	it('handles variable widths', () => {
		const varied = [100, 300, 50, 200, 400, 150];
		const w = computeHWindow(360, 300, varied, 0);
		// x=360 falls inside col2 (100+300=400 > 360 → col1 right edge 400 > 360 → firstCol=1)
		expect(w.firstCol).toBe(1);
		expect(w.offsetX).toBe(100);
		expect(w.totalWidth).toBe(1200);
	});

	it('clamps overscroll and reaches the last column', () => {
		const w = computeHWindow(1e9, 900, widths);
		expect(w.firstCol + w.count).toBe(150);
	});

	it('zero viewport width renders minimally, never crashes', () => {
		const w = computeHWindow(0, 0, widths);
		expect(w.count).toBeGreaterThanOrEqual(1);
		expect(w.count).toBeLessThanOrEqual(5);
	});

	it('empty columns', () => {
		expect(computeHWindow(0, 900, [])).toEqual({ firstCol: 0, count: 0, offsetX: 0, totalWidth: 0 });
	});
});

describe('Grid column state', () => {
	const make = () =>
		createGrid<Record<string, unknown>>({
			columns: [
				{ id: 'a', width: 100 },
				{ id: 'b', width: 200 },
				{ id: 'c' } // default width 150
			],
			getRowId: (r) => r.id as string,
			data: [{ id: 'r1', a: 1, b: 2, c: 3 }]
		});

	it('resolves visible columns with widths and total', () => {
		const grid = make();
		expect(grid.visibleColumns.columns.map((c) => c.width)).toEqual([100, 200, 150]);
		expect(grid.visibleColumns.totalWidth).toBe(450);
	});

	it('width overrides clamp and update the total', () => {
		const grid = make();
		grid.setColumnWidth('a', 10); // clamps to 40
		expect(grid.visibleColumns.columns[0]!.width).toBe(40);
		expect(grid.visibleColumns.totalWidth).toBe(390);
	});

	it('hiding excludes a column; showAll restores', () => {
		const grid = make();
		grid.setColumnVisible('b', false);
		expect(grid.visibleColumns.columns.map((c) => c.id)).toEqual(['a', 'c']);
		grid.showAllColumns();
		expect(grid.visibleColumns.columns.map((c) => c.id)).toEqual(['a', 'b', 'c']);
	});

	it('moveColumn reorders before a target and to the end', () => {
		const grid = make();
		grid.moveColumn('c', 'a');
		expect(grid.visibleColumns.columns.map((c) => c.id)).toEqual(['c', 'a', 'b']);
		grid.moveColumn('c', null);
		expect(grid.visibleColumns.columns.map((c) => c.id)).toEqual(['a', 'b', 'c']);
	});

	it('hwindow follows layout changes and notifies subscribers', () => {
		const grid = make();
		grid.setViewportWidth(250);
		let notified = 0;
		grid.subscribe('hwindow', () => notified++);
		grid.setColumnWidth('a', 400);
		expect(notified).toBe(1);
		expect(grid.hwindow.columns[0]!.width).toBe(400);
		// hidden column never appears in the window
		grid.setColumnVisible('a', false);
		expect(grid.hwindow.columns.map((c) => c.id)).not.toContain('a');
	});

	it('original config columns remain addressable for sort/filter (hidden included)', async () => {
		const grid = make();
		grid.setColumnVisible('a', false);
		await grid.setSortModel([{ columnId: 'a', dir: 'asc' }]); // must not throw
		expect(grid.sortModel).toHaveLength(1);
	});
});
