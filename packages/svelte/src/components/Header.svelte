<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import type { Snippet } from 'svelte';
	import { getTableContext } from './context';
	import { filterKind } from './filter-kind';
	import FilterControl from './FilterControl.svelte';

	let {
		cell,
		filters = true
	}: { cell?: Snippet<[ColumnDef]>; filters?: boolean } = $props();

	const view = getTableContext();
	const anyFilterable = $derived(view.grid.columns.some((c) => filterKind(c) !== 'none'));
	const showFilters = $derived(filters && anyFilterable);
</script>

<div data-speedy-header role="row" style="overflow:hidden; flex:none;">
	<div style="display:flex; width:{view.totalWidth}px; transform:translateX({-view.scrollLeft}px);">
		{#each view.grid.columns as column (column.id)}
			{#if cell}
				{@render cell(column)}
			{:else}
				{@const dir = view.sortDirection(column.id)}
				<div
					data-speedy-header-cell
					data-sort={dir}
					data-dtype={column.dataType ?? 'text'}
					role="columnheader"
					aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
					style="width:{column.width ?? 150}px; flex:none; overflow:hidden; display:flex; flex-direction:column;"
				>
					<button
						type="button"
						data-speedy-header-label
						onclick={() => view.toggleSort(column.id)}
					>
						<span>{column.header ?? column.id}</span>
						{#if dir}
							<span data-speedy-sort-indicator aria-hidden="true">{dir === 'asc' ? '▲' : '▼'}</span>
						{/if}
					</button>
					{#if showFilters}
						<div data-speedy-header-filter>
							<FilterControl {column} />
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>
