<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RowData } from '../view.svelte';
	import { getTableContext } from './context';
	import Row from './Row.svelte';

	let { row }: { row?: Snippet<[{ row: RowData; index: number }]> } = $props();

	const view = getTableContext();
	let el: HTMLDivElement;

	function onscroll() {
		view.scrollLeft = el.scrollLeft;
		view.grid.setScrollTop(el.scrollTop);
	}

	$effect(() => {
		view.grid.setViewportHeight(el.clientHeight);
		const observer = new ResizeObserver(() => view.grid.setViewportHeight(el.clientHeight));
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div data-speedy-viewport bind:this={el} {onscroll} style="overflow:auto; flex:1; position:relative;">
	<div
		data-speedy-canvas
		style="height:{view.position.virtualHeight}px; width:{view.totalWidth}px; position:relative; overflow:hidden;"
	>
		<div
			data-speedy-rows
			style="position:absolute; top:0; left:0; width:100%; transform:translateY({view.position
				.blockTop}px);"
		>
			<!-- Unkeyed each: on scroll the DOM nodes are reused and only text updates. -->
			{#each view.window.rows as rowData, i}
				{#if row}
					{@render row({ row: rowData, index: view.window.firstRow + i })}
				{:else}
					<Row row={rowData} index={view.window.firstRow + i} />
				{/if}
			{/each}
		</div>
	</div>
</div>
