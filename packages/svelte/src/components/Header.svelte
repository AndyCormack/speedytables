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
				{@const dir = view.sortDirection(column.id)}
				<div
					data-speedy-header-cell
					data-sort={dir}
					role="columnheader"
					tabindex="0"
					aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
					style="width:{column.width ?? 150}px; flex:none; overflow:hidden; cursor:pointer; user-select:none;"
					onclick={() => view.toggleSort(column.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							view.toggleSort(column.id);
						}
					}}
				>
					{column.header ?? column.id}{dir === 'asc' ? ' ▲' : dir === 'desc' ? ' ▼' : ''}
				</div>
			{/if}
		{/each}
	</div>
</div>
