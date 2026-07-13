<script lang="ts">
	import type { Grid } from '@speedytables/core';
	import type { Snippet } from 'svelte';
	import type { PartClasses } from '../parts';
	import { GridView, type RowData } from '../view.svelte';
	import { setTableContext } from './context';

	let {
		grid,
		classes,
		children
	}: { grid: Grid<RowData>; classes?: PartClasses; children?: Snippet } = $props();

	// One Grid per Root for its lifetime — swap grids by remounting Root.
	// svelte-ignore state_referenced_locally
	const view = new GridView(grid);
	// svelte-ignore state_referenced_locally -- part classes are static config
	view.classes = classes ?? {};
	setTableContext(view);

	$effect(() => () => view.destroy());
</script>

<!-- Structural styles only: Table.* is headless — style via the data attributes or part classes. -->
<div
	data-speedy-root
	class={view.classes.root}
	style="position:relative; display:flex; flex-direction:column; height:100%;"
>
	{@render children?.()}
</div>
