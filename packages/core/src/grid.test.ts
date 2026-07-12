import { describe, expect, it } from 'vitest';
import { createGrid } from './grid';
import type { ColumnDef } from './types';

interface Item {
	id: string;
	name: string;
	kind: string;
	price: number;
	[key: string]: unknown;
}

const columns: ColumnDef[] = [
	{ id: 'name', dataType: 'text' },
	{ id: 'kind', dataType: 'text' },
	{ id: 'price', dataType: 'number' }
];

const data: Item[] = [
	{ id: 'a', name: 'Pacific Systems', kind: 'x', price: 30 },
	{ id: 'b', name: 'Global Holdings', kind: 'y', price: 10 },
	{ id: 'c', name: 'pacific holdings', kind: 'x', price: 20 },
	{ id: 'd', name: 'Apex Networks', kind: 'z', price: 40 },
	{ id: 'e', name: 'Pacific Capital', kind: 'y', price: 5 }
];

function makeGrid() {
	const grid = createGrid<Item>({ columns, getRowId: (r) => r.id, data });
	grid.setViewportHeight(320); // 10 visible rows — everything fits
	return grid;
}

const ids = (grid: ReturnType<typeof makeGrid>) => grid.window.rows.map((r) => r.id);

describe('Grid filtering', () => {
	it('contains is case-insensitive and preserves source order', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'name', type: 'contains', value: 'pacific' }]);
		expect(ids(grid)).toEqual(['a', 'c', 'e']);
		expect(grid.rowCount).toBe(3);
	});

	it('typeahead refinement matches a fresh scan', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'name', type: 'contains', value: 'pa' }]);
		await grid.setFilterModel([{ columnId: 'name', type: 'contains', value: 'pacific c' }]);
		const refined = ids(grid);

		const fresh = makeGrid();
		await fresh.setFilterModel([{ columnId: 'name', type: 'contains', value: 'pacific c' }]);
		expect(refined).toEqual(ids(fresh));
		expect(refined).toEqual(['e']);
	});

	it('range filters number columns inclusively', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'price', type: 'range', min: 10, max: 30 }]);
		expect(ids(grid)).toEqual(['a', 'b', 'c']);
		await grid.setFilterModel([{ columnId: 'price', type: 'range', min: 25 }]);
		expect(ids(grid)).toEqual(['a', 'd']);
		await grid.setFilterModel([{ columnId: 'price', type: 'range', max: 10 }]);
		expect(ids(grid)).toEqual(['b', 'e']);
	});

	it('range refinement (tightened bounds) matches a fresh scan', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'price', type: 'range', min: 5 }]);
		await grid.setFilterModel([{ columnId: 'price', type: 'range', min: 15, max: 35 }]);
		const refined = ids(grid);
		const fresh = makeGrid();
		await fresh.setFilterModel([{ columnId: 'price', type: 'range', min: 15, max: 35 }]);
		expect(refined).toEqual(ids(fresh));
		expect(refined).toEqual(['a', 'c']);
	});

	it('in-set filters on exact values', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'kind', type: 'in', values: ['x', 'z'] }]);
		expect(ids(grid)).toEqual(['a', 'c', 'd']);
	});

	it('specs AND together across columns', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([
			{ columnId: 'name', type: 'contains', value: 'pacific' },
			{ columnId: 'kind', type: 'in', values: ['y'] }
		]);
		expect(ids(grid)).toEqual(['e']);
	});

	it('composes with sort: filter then order', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'name', type: 'contains', value: 'pacific' }]);
		await grid.setSortModel([{ columnId: 'price', dir: 'asc' }]);
		expect(ids(grid)).toEqual(['e', 'c', 'a']);
		// widening back out re-sorts the larger set
		await grid.setFilterModel([]);
		expect(ids(grid)).toEqual(['e', 'b', 'c', 'a', 'd']);
	});

	it('applyDelta update changes the visible row in place', async () => {
		const grid = makeGrid();
		await grid.applyDelta({ update: [{ id: 'b', name: 'Global Holdings', kind: 'y', price: 99 }] });
		expect(grid.window.rows.find((r) => r.id === 'b')?.price).toBe(99);
		expect(grid.rowCount).toBe(5);
	});

	it('applyDelta re-positions an updated row under an active sort', async () => {
		const grid = makeGrid();
		await grid.setSortModel([{ columnId: 'price', dir: 'asc' }]);
		expect(ids(grid)).toEqual(['e', 'b', 'c', 'a', 'd']);
		await grid.applyDelta({ update: [{ id: 'e', name: 'Pacific Capital', kind: 'y', price: 35 }] });
		expect(ids(grid)).toEqual(['b', 'c', 'a', 'e', 'd']);
	});

	it('applyDelta moves rows in and out of an active filter', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'price', type: 'range', min: 25 }]);
		await grid.setSortModel([{ columnId: 'price', dir: 'asc' }]);
		expect(ids(grid)).toEqual(['a', 'd']);
		await grid.applyDelta({
			update: [
				{ id: 'a', name: 'Pacific Systems', kind: 'x', price: 1 }, // leaves
				{ id: 'b', name: 'Global Holdings', kind: 'y', price: 50 } // enters
			]
		});
		expect(ids(grid)).toEqual(['d', 'b']);
	});

	it('coalesces same-frame deltas; last write to a row wins', async () => {
		const grid = makeGrid();
		await grid.setSortModel([{ columnId: 'price', dir: 'asc' }]);
		const first = grid.applyDelta({ update: [{ id: 'a', name: 'Pacific Systems', kind: 'x', price: 1 }] });
		const second = grid.applyDelta({ update: [{ id: 'a', name: 'Pacific Systems', kind: 'x', price: 100 }] });
		expect(second).toBe(first); // same flush
		await second;
		expect(grid.window.rows.filter((r) => r.id === 'a')).toHaveLength(1);
		expect(ids(grid)).toEqual(['e', 'b', 'c', 'd', 'a']);
	});

	it('applyDelta insert and remove rebuild the pipeline', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'kind', type: 'in', values: ['x'] }]);
		await grid.applyDelta({
			insert: [{ id: 'f', name: 'New Corp', kind: 'x', price: 7 }],
			remove: ['a']
		});
		expect(grid.rowCount).toBe(2);
		expect(ids(grid)).toEqual(['c', 'f']);
	});

	it('clearing the filter restores all rows and the window follows rowCount', async () => {
		const grid = makeGrid();
		await grid.setFilterModel([{ columnId: 'kind', type: 'in', values: ['nope'] }]);
		expect(grid.rowCount).toBe(0);
		expect(ids(grid)).toEqual([]);
		await grid.setFilterModel([]);
		expect(grid.rowCount).toBe(5);
		expect(ids(grid)).toEqual(['a', 'b', 'c', 'd', 'e']);
	});
});
