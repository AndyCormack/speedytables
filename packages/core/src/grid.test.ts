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
