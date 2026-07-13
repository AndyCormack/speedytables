<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RowData } from '../view.svelte';
	import { getTableContext } from './context';
	import Row from './Row.svelte';

	let { row }: { row?: Snippet<[{ row: RowData; index: number }]> } = $props();

	const view = getTableContext();
	let el: HTMLDivElement;

	let rafPending = false;

	function syncScroll() {
		view.scrollLeft = el.scrollLeft;
		view.grid.setScrollTop(el.scrollTop);
		view.grid.setScrollLeft(el.scrollLeft);
	}

	// Scroll events for programmatic scrolls fire one frame late, so rows would
	// lag (or blank out) behind fast scrollbar drags and driven scrolls. Re-read
	// the position once per frame via rAF — registered only on scroll activity,
	// and rAF order runs it after any same-frame scrollTop mutation.
	function onscroll() {
		syncScroll();
		if (rafPending) return;
		rafPending = true;
		requestAnimationFrame(() => {
			rafPending = false;
			syncScroll();
		});
	}

	$effect(() => {
		const measure = () => {
			view.grid.setViewportHeight(el.clientHeight);
			view.grid.setViewportWidth(el.clientWidth);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div
	data-speedy-viewport
	class={view.classes.viewport}
	bind:this={el}
	{onscroll}
	style="overflow:auto; flex:1; position:relative;"
>
	<div
		data-speedy-canvas
		class={view.classes.canvas}
		style="height:{view.position.virtualHeight}px; width:{view.totalWidth}px; position:relative; overflow:hidden;"
	>
		<div
			data-speedy-rows
			class={view.classes.rows}
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
