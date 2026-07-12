import { getContext, setContext } from 'svelte';
import type { GridView } from '../view.svelte';

const KEY = Symbol('speedytables');

export function setTableContext(view: GridView): void {
	setContext(KEY, view);
}

export function getTableContext(): GridView {
	const view = getContext<GridView>(KEY);
	if (!view) throw new Error('speedytables: Table.* components must be inside <Table.Root>');
	return view;
}
