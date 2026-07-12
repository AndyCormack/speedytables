<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import type { Snippet } from 'svelte';
	import { getTableContext } from './context';

	let { cell }: { cell?: Snippet<[ColumnDef]> } = $props();

	const view = getTableContext();

	function toggleValue(columnId: string, value: string, checked: boolean) {
		const current = view.inValues(columnId) ?? [];
		view.setIn(columnId, checked ? [...current, value] : current.filter((v) => v !== value));
	}
</script>

<div data-speedy-filter-row role="row" style="overflow:hidden; flex:none;">
	<div style="display:flex; width:{view.totalWidth}px; transform:translateX({-view.scrollLeft}px);">
		{#each view.grid.columns as column (column.id)}
			{#if cell}
				{@render cell(column)}
			{:else}
				{@const width = column.width ?? 150}
				{#if (column.filter ?? 'text') === 'none'}
					<div data-speedy-filter-cell style="width:{width}px; flex:none;"></div>
				{:else if column.filter === 'enum'}
					{@const selected = view.inValues(column.id)}
					<div data-speedy-filter-cell style="width:{width}px; flex:none; position:relative;">
						<details data-speedy-enum-filter>
							<summary data-speedy-enum-summary>
								{selected ? `${selected.length} selected` : 'All'}
							</summary>
							<div data-speedy-enum-options style="position:absolute; z-index:2;">
								{#each column.filterValues ?? [] as value (value)}
									<label style="display:block; white-space:nowrap;">
										<input
											type="checkbox"
											checked={selected?.includes(value) ?? false}
											onchange={(e) => toggleValue(column.id, value, e.currentTarget.checked)}
										/>
										{value}
									</label>
								{/each}
							</div>
						</details>
					</div>
				{:else}
					<div data-speedy-filter-cell style="width:{width}px; flex:none;">
						<input
							data-speedy-filter-input
							type="text"
							placeholder="Filter…"
							aria-label="Filter {column.header ?? column.id}"
							value={view.containsValue(column.id)}
							oninput={(e) => view.setContains(column.id, e.currentTarget.value)}
						/>
					</div>
				{/if}
			{/if}
		{/each}
	</div>
</div>
