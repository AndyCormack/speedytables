<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RowData } from '../view.svelte';
	import { getTableContext } from './context';
	import Cell from './Cell.svelte';

	let {
		row,
		index,
		children
	}: { row: RowData; index: number; children?: Snippet } = $props();

	const view = getTableContext();
</script>

<div
	data-speedy-row
	role="row"
	aria-rowindex={index + 1}
	style="display:flex; height:{view.grid.rowHeight}px;"
>
	{#if children}
		{@render children()}
	{:else}
		{#each view.grid.columns as column (column.id)}
			<Cell {row} {column} />
		{/each}
	{/if}
</div>
