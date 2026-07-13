<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import type { Snippet } from 'svelte';
	import { getTableContext } from './context';
	import { filterKind } from './filter-kind';
	import FilterControl from './FilterControl.svelte';
	import ColumnMenu from './ColumnMenu.svelte';

	let {
		cell,
		filters = true
	}: { cell?: Snippet<[ColumnDef]>; filters?: boolean } = $props();

	const view = getTableContext();
	const anyFilterable = $derived(view.grid.columns.some((c) => filterKind(c) !== 'none'));
	const showFilters = $derived(filters && anyFilterable);

	let dragId: string | null = null;

	function startResize(column: ColumnDef, event: PointerEvent) {
		event.stopPropagation();
		const startX = event.clientX;
		const startWidth = column.width ?? 150;
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);
		const move = (e: PointerEvent) => view.setColumnWidth(column.id, startWidth + e.clientX - startX);
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
	}
</script>

<div data-speedy-header class={view.classes.header} role="row" style="overflow:hidden; flex:none;">
	<div style="width:{view.totalWidth}px; transform:translateX({-view.scrollLeft}px);">
		<div style="display:flex; transform:translateX({view.hwindow.offsetX}px);">
			{#each view.hwindow.columns as column (column.id)}
				{#if cell}
					{@render cell(column)}
				{:else}
					{@const dir = view.sortDirection(column.id)}
					<!-- svelte-ignore a11y_interactive_supports_focus -- drop target only; keyboard interaction lives on the inner sort button -->
					<div
						data-speedy-header-cell
						class={view.classes.headerCell}
						data-sort={dir}
						data-dtype={column.dataType ?? 'text'}
						role="columnheader"
						aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
						style="width:{column.width ?? 150}px; box-sizing:border-box; flex:none; overflow:hidden; display:flex; flex-direction:column; position:relative;"
						ondragover={(e) => {
							if (dragId && dragId !== column.id) e.preventDefault();
						}}
						ondrop={(e) => {
							e.preventDefault();
							if (dragId && dragId !== column.id) view.moveColumn(dragId, column.id);
							dragId = null;
						}}
					>
						<div data-speedy-header-top class={view.classes.headerTop}>
							<button
								type="button"
								data-speedy-header-label
								class={view.classes.headerLabel}
								draggable="true"
								ondragstart={(e) => {
									dragId = column.id;
									e.dataTransfer?.setData('text/plain', column.id);
								}}
								ondragend={() => (dragId = null)}
								onclick={() => view.toggleSort(column.id)}
							>
								<span>{column.header ?? column.id}</span>
								{#if dir}
									<span data-speedy-sort-indicator class={view.classes.sortIndicator} aria-hidden="true">{dir === 'asc' ? '▲' : '▼'}</span>
								{/if}
							</button>
							<ColumnMenu {column} />
						</div>
						{#if showFilters}
							<div data-speedy-header-filter class={view.classes.headerFilter}>
								<FilterControl {column} />
							</div>
						{/if}
						<span
							data-speedy-resize-handle
							class={view.classes.resizeHandle}
							role="separator"
							aria-orientation="vertical"
							aria-label="Resize {column.header ?? column.id}"
							onpointerdown={(e) => startResize(column, e)}
						></span>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
