<script lang="ts">
	import { page } from '$app/state';
	import { SIZES, type SizeKey } from '$lib/dataset';
	import { drivers, type GridDriver, type GridName } from '$lib/drivers';

	const { data } = $props();

	const scenario = $derived(data.scenario);
	const gridName = $derived((page.url.searchParams.get('grid') ?? 'aggrid') as GridName);
	const sizeKey = $derived((page.url.searchParams.get('size') ?? scenario.defaultSize) as SizeKey);

	let container: HTMLElement;
	let driver: GridDriver | null = null;
	let results = $state<Record<string, number> | null>(null);
	let running = $state(false);
	let error = $state<string | null>(null);

	async function run(): Promise<Record<string, number>> {
		running = true;
		error = null;
		results = null;
		try {
			driver?.destroy();
			container.replaceChildren();
			driver = drivers[gridName]();
			results = await scenario.run({ driver, el: container, size: SIZES[sizeKey] });
			return results;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			throw e;
		} finally {
			running = false;
		}
	}

	$effect(() => {
		// Contract with tools/bench: the runner waits for window.__scenario, calls run().
		const handle = { name: scenario.name, grid: gridName, size: sizeKey, run };
		(window as unknown as Record<string, unknown>).__scenario = handle;
		return () => {
			driver?.destroy();
			delete (window as unknown as Record<string, unknown>).__scenario;
		};
	});
</script>

<svelte:head>
	<title>{scenario.name} · {gridName} · SpeedyTables bench</title>
</svelte:head>

<header>
	<h1>{scenario.name}</h1>
	<p>{scenario.description}</p>
	<p class="meta">
		grid: <strong>{gridName}</strong> · rows: <strong>{sizeKey}</strong>
		{#each Object.keys(SIZES) as key (key)}
			· <a href="?grid={gridName}&size={key}">{key}</a>
		{/each}
		· <a href="?grid={gridName === 'aggrid' ? 'speedy' : 'aggrid'}&size={sizeKey}">
			switch to {gridName === 'aggrid' ? 'speedy' : 'aggrid'}
		</a>
	</p>
	<button onclick={run} disabled={running}>{running ? 'Running…' : 'Run scenario'}</button>
</header>

{#if error}
	<p class="error">{error}</p>
{/if}

{#if results}
	<table class="results">
		<tbody>
			{#each Object.entries(results) as [key, value] (key)}
				<tr><th>{key}</th><td>{value}</td></tr>
			{/each}
		</tbody>
	</table>
{/if}

<div class="grid-host" bind:this={container}></div>

<style>
	header {
		padding: 0.5rem 1rem;
	}
	h1 {
		margin: 0;
		font-size: 1.25rem;
	}
	p {
		margin: 0.25rem 0;
	}
	.meta {
		color: #666;
	}
	.error {
		color: #c00;
		padding: 0 1rem;
	}
	.results {
		margin: 0.5rem 1rem;
		border-collapse: collapse;
		font-size: 0.85rem;
	}
	.results th,
	.results td {
		border: 1px solid #ccc;
		padding: 0.15rem 0.5rem;
		text-align: left;
	}
	.grid-host {
		height: 600px;
		margin: 0.5rem 1rem;
	}

	/*
	 * SpeedyTables demo theme — styles the headless components via data attributes.
	 * Tokens: restrained strategy; steel-teal accent carries selection/state only.
	 * (Captured in DESIGN.md.)
	 */
	.grid-host {
		--st-ink: oklch(0.28 0.015 255);
		--st-ink-soft: oklch(0.45 0.02 255);
		--st-bg: oklch(1 0 0);
		--st-surface: oklch(0.973 0.004 250);
		--st-surface-hover: oklch(0.955 0.006 250);
		--st-border: oklch(0.91 0.007 250);
		--st-border-strong: oklch(0.83 0.012 250);
		--st-accent: oklch(0.5 0.11 220);
		--st-accent-tint: oklch(0.96 0.02 220);
		--st-radius: 4px;
		--st-focus-ring: 0 0 0 2px oklch(0.5 0.11 220 / 0.3);
		--st-ease: cubic-bezier(0.165, 0.84, 0.44, 1);
	}

	.grid-host :global([data-speedy-root]) {
		border: 1px solid var(--st-border-strong);
		border-radius: var(--st-radius);
		background: var(--st-bg);
		color: var(--st-ink);
		font-size: 13px;
		overflow: clip;
	}

	/* header: sortable label line + integrated filter line per column */
	.grid-host :global([data-speedy-header]) {
		background: var(--st-surface);
		border-bottom: 1px solid var(--st-border-strong);
	}
	.grid-host :global([data-speedy-header-label]) {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 100%;
		padding: 0 10px;
		border: none;
		background: transparent;
		font: inherit;
		font-weight: 600;
		color: var(--st-ink);
		line-height: 30px;
		cursor: pointer;
		text-align: left;
		transition: background-color 150ms var(--st-ease);
	}
	.grid-host :global([data-speedy-header-label]:hover) {
		background: var(--st-surface-hover);
	}
	.grid-host :global([data-speedy-header-label]:focus-visible) {
		outline: none;
		box-shadow: inset var(--st-focus-ring);
	}
	.grid-host :global([data-speedy-header-cell][data-sort] [data-speedy-header-label]) {
		color: var(--st-accent);
	}
	.grid-host :global([data-speedy-sort-indicator]) {
		font-size: 9px;
		color: var(--st-accent);
	}
	.grid-host :global([data-speedy-header-cell][data-dtype='number'] [data-speedy-header-label]) {
		justify-content: flex-end;
	}
	.grid-host :global([data-speedy-header-filter]) {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px 6px;
		min-height: 30px;
	}
	.grid-host :global([data-speedy-header-filter] [data-speedy-contains]),
	.grid-host :global([data-speedy-header-filter] [data-speedy-range]) {
		display: flex;
		gap: 4px;
		width: 100%;
		min-width: 0;
	}

	/* body */
	.grid-host :global([data-speedy-row]) {
		border-bottom: 1px solid var(--st-border);
		background: var(--st-bg);
	}
	.grid-host :global([data-speedy-row]:hover) {
		background: var(--st-surface);
	}
	.grid-host :global([data-speedy-cell]) {
		padding: 0 10px;
		line-height: 31px;
	}
	.grid-host :global([data-speedy-cell][data-dtype='number']) {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* filter controls */
	.grid-host :global([data-speedy-filter-input]),
	.grid-host :global([data-speedy-enum-trigger]) {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		height: 24px;
		padding: 0 8px;
		font: inherit;
		font-size: 12px;
		color: var(--st-ink);
		background: var(--st-bg);
		border: 1px solid var(--st-border-strong);
		border-radius: var(--st-radius);
		transition:
			border-color 150ms var(--st-ease),
			box-shadow 150ms var(--st-ease);
	}
	.grid-host :global([data-speedy-filter-input])::placeholder {
		color: var(--st-ink-soft);
	}
	.grid-host :global([data-speedy-filter-input]:hover),
	.grid-host :global([data-speedy-enum-trigger]:hover) {
		border-color: var(--st-accent);
	}
	.grid-host :global([data-speedy-filter-input]:focus-visible),
	.grid-host :global([data-speedy-enum-trigger]:focus-visible) {
		outline: none;
		border-color: var(--st-accent);
		box-shadow: var(--st-focus-ring);
	}
	.grid-host :global([data-active] > [data-speedy-filter-input]),
	.grid-host :global([data-speedy-enum-trigger][data-active]) {
		border-color: var(--st-accent);
		background: var(--st-accent-tint);
	}
	.grid-host :global([data-speedy-range] input::-webkit-outer-spin-button),
	.grid-host :global([data-speedy-range] input::-webkit-inner-spin-button) {
		appearance: none;
	}
	.grid-host :global([data-speedy-filter-clear]) {
		position: absolute;
		right: 4px;
		top: 50%;
		translate: 0 -50%;
		width: 16px;
		height: 16px;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--st-ink-soft);
		font-size: 13px;
		line-height: 1;
		cursor: pointer;
	}
	.grid-host :global([data-speedy-filter-clear]:hover) {
		background: var(--st-border);
		color: var(--st-ink);
	}
	.grid-host :global([data-speedy-enum-trigger]) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		cursor: pointer;
		text-align: left;
	}
	.grid-host :global([data-speedy-enum-chevron]) {
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-top: 5px solid var(--st-ink-soft);
		flex: none;
	}

	/* enum panel — rendered in the top layer via the Popover API */
	:global([data-speedy-enum-panel]) {
		border: 1px solid oklch(0.83 0.012 250);
		border-radius: 6px;
		background: #fff;
		color: oklch(0.28 0.015 255);
		font-size: 12px;
		padding: 4px;
		box-shadow:
			0 2px 6px oklch(0 0 0 / 0.06),
			0 8px 24px oklch(0 0 0 / 0.12);
		max-height: 280px;
		overflow-y: auto;
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 150ms cubic-bezier(0.165, 0.84, 0.44, 1),
			transform 150ms cubic-bezier(0.165, 0.84, 0.44, 1),
			overlay 150ms allow-discrete,
			display 150ms allow-discrete;
	}
	@starting-style {
		:global([data-speedy-enum-panel]:popover-open) {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global([data-speedy-enum-panel]) {
			transition: none;
		}
		.grid-host :global(*) {
			transition: none !important;
		}
	}
	:global([data-speedy-enum-head]) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 4px 8px 6px;
		border-bottom: 1px solid oklch(0.91 0.007 250);
		margin-bottom: 4px;
		font-weight: 600;
	}
	:global([data-speedy-enum-reset]) {
		border: none;
		background: transparent;
		font: inherit;
		font-size: 11px;
		color: oklch(0.5 0.11 220);
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 4px;
	}
	:global([data-speedy-enum-reset]:hover:not(:disabled)) {
		background: oklch(0.96 0.02 220);
	}
	:global([data-speedy-enum-reset]:disabled) {
		color: oklch(0.7 0.01 250);
		cursor: default;
	}
	:global([data-speedy-enum-option]) {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
	}
	:global([data-speedy-enum-option]:hover) {
		background: oklch(0.973 0.004 250);
	}
	:global([data-speedy-enum-option] input) {
		accent-color: oklch(0.5 0.11 220);
		margin: 0;
	}
</style>
