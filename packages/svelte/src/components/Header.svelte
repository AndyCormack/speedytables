<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import type { Snippet } from 'svelte';
	import { getTableContext } from './context';

	let { cell }: { cell?: Snippet<[ColumnDef]> } = $props();

	const view = getTableContext();
</script>

<div data-speedy-header role="row" style="overflow:hidden; flex:none;">
	<div
		style="display:flex; width:{view.totalWidth}px; transform:translateX({-view.scrollLeft}px);"
	>
		{#each view.grid.columns as column (column.id)}
			{#if cell}
				{@render cell(column)}
			{:else}
				<div
					data-speedy-header-cell
					role="columnheader"
					style="width:{column.width ?? 150}px; flex:none; overflow:hidden;"
				>
					{column.header ?? column.id}
				</div>
			{/if}
		{/each}
	</div>
</div>
