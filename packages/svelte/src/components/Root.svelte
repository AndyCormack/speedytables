<script lang="ts">
	import type { Grid } from '@speedytables/core';
	import type { Snippet } from 'svelte';
	import { GridView, type RowData } from '../view.svelte';
	import { setTableContext } from './context';

	let { grid, children }: { grid: Grid<RowData>; children?: Snippet } = $props();

	// One Grid per Root for its lifetime — swap grids by remounting Root.
	// svelte-ignore state_referenced_locally
	const view = new GridView(grid);
	setTableContext(view);

	$effect(() => () => view.destroy());
</script>

<!-- Structural styles only: Table.* is headless — style via the data attributes. -->
<div data-speedy-root style="position:relative; display:flex; flex-direction:column; height:100%;">
	{@render children?.()}
</div>
