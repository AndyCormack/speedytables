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

<!-- parity from the absolute row index: zebra themes stay stable while the window scrolls -->
<div
	data-speedy-row
	class={view.classes.row}
	data-parity={index % 2 ? 'odd' : 'even'}
	role="row"
	aria-rowindex={index + 1}
	style="height:{view.grid.rowHeight}px;"
>
	{#if children}
		{@render children()}
	{:else}
		<div style="display:flex; height:100%; transform:translateX({view.hwindow.offsetX}px);">
			{#each view.hwindow.columns as column (column.id)}
				<Cell {row} {column} />
			{/each}
		</div>
	{/if}
</div>
