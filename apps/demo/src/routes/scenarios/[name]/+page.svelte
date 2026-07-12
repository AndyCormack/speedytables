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
	/* Minimal styling for the headless speedy grid, via its data attributes. */
	.grid-host :global([data-speedy-root]) {
		border: 1px solid #ccc;
		font-size: 0.85rem;
	}
	.grid-host :global([data-speedy-header]) {
		background: #f5f5f5;
		border-bottom: 1px solid #ccc;
		font-weight: 600;
	}
	.grid-host :global([data-speedy-header-cell]),
	.grid-host :global([data-speedy-cell]) {
		padding: 0 0.5rem;
		line-height: 32px;
	}
	.grid-host :global([data-speedy-row]) {
		border-bottom: 1px solid #eee;
		background: #fff;
	}
</style>
