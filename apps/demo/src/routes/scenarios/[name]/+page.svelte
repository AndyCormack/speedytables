<script lang="ts">
	// scenario pages dogfood the shipped themes (ADR-0005): the theme picked in
	// the gallery or editor applies here too; the tailwind utilities import is
	// inert unless the class preset is active
	import '@speedytables/svelte/themes/base.css';
	import '@speedytables/svelte/themes/graphite.css';
	import '@speedytables/svelte/themes/porcelain.css';
	import '@speedytables/svelte/themes/oxide.css';
	import '@speedytables/svelte/themes/ledger.css';
	import '@speedytables/svelte/themes/aurora.css';
	import '$lib/tailwind-utilities.css';
	import { tailwindTheme } from '@speedytables/svelte/themes/tailwind';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		bestOf,
		clearRuns,
		compareMetric,
		loadRun,
		metricKeys,
		relativeTime,
		saveRun,
		type StoredRun,
		type StoreVariant
	} from '$lib/compare';
	import { SIZES, type SizeKey } from '$lib/dataset';
	import { drivers, type GridDriver, type GridName } from '$lib/drivers';
	import { measureWorkerHeapMB } from '$lib/memory';
	import { pickedTheme, resolveTheme, THEMES, type ResolvedTheme } from '$lib/themes';

	const { data } = $props();

	const scenario = $derived(data.scenario);
	const gridName = $derived((page.url.searchParams.get('grid') ?? 'aggrid') as GridName);
	const sizeKey = $derived((page.url.searchParams.get('size') ?? scenario.defaultSize) as SizeKey);
	// hybrid is the library default (measured best all-rounder) — the demo mirrors it
	const exec = $derived.by(() => {
		const value = page.url.searchParams.get('exec');
		return value === 'worker' || value === 'main' ? value : 'hybrid';
	});
	/** storage bucket: each executor is a separate speedy variant in the comparison */
	const speedyStoreKey = $derived(
		(exec === 'main' ? 'speedy' : `speedy-${exec}`) as 'speedy' | 'speedy-worker' | 'speedy-hybrid'
	);
	// ?theme= pins the theme (the bench contract — runners start with fresh storage);
	// otherwise the theme picked in the gallery or saved in the editor applies.
	const theme = $derived.by((): ResolvedTheme => {
		const param = page.url.searchParams.get('theme');
		return (param ? resolveTheme(param) : pickedTheme()) ?? THEMES[0]!;
	});
	const overrideStyle = $derived(
		theme.saved
			? Object.entries(theme.saved.overrides)
					.map(([k, v]) => `${k}: ${v}`)
					.join('; ')
			: ''
	);

	// baseline first: test the grid we're comparing against, then the improvement
	const GRIDS: { id: GridName; label: string }[] = [
		{ id: 'aggrid', label: 'AG Grid' },
		{ id: 'speedy', label: 'SpeedyTables' }
	];

	let container: HTMLElement;
	let driver: GridDriver | null = null;
	let running = $state(false);
	let error = $state<string | null>(null);

	// Stored results survive grid switches and reloads (per scenario + size);
	// every variant that has been run gets its own comparison column.
	const VARIANT_COLUMNS: { key: StoreVariant; label: string }[] = [
		{ key: 'aggrid', label: 'AG Grid' },
		{ key: 'speedy', label: 'Speedy · main' },
		{ key: 'speedy-worker', label: 'Speedy · worker' },
		{ key: 'speedy-hybrid', label: 'Speedy · hybrid' }
	];
	let storedVersion = $state(0);
	const columns = $derived.by(() => {
		void storedVersion;
		void page.url; // re-read after navigation
		return VARIANT_COLUMNS.map((v) => ({ ...v, run: loadRun(scenario.name, sizeKey, v.key) })).filter(
			(v): v is { key: StoreVariant; label: string; run: StoredRun } => v.run !== null
		);
	});
	const currentVariant = $derived(gridName === 'aggrid' ? 'aggrid' : speedyStoreKey);
	const anyStored = $derived(columns.length > 0);

	// While a run is live, its column dims with a spinner; a variant with no
	// stored results yet appears as a pending placeholder column.
	const displayColumns = $derived.by(() => {
		const cols: { key: StoreVariant; label: string; run: StoredRun | null; pending: boolean }[] =
			columns.map((c) => ({ ...c, pending: running && c.key === currentVariant }));
		if (running && !cols.some((c) => c.pending)) {
			const meta = VARIANT_COLUMNS.find((v) => v.key === currentVariant)!;
			cols.push({ ...meta, run: null, pending: true });
		}
		return cols;
	});

	function select(param: 'grid' | 'size' | 'exec', value: string) {
		const grid = param === 'grid' ? value : gridName;
		const size = param === 'size' ? value : sizeKey;
		const ex = param === 'exec' ? value : exec;
		// hybrid is the default → omitted; main/worker are explicit
		const execParam = grid === 'speedy' && ex !== 'hybrid' ? `&exec=${ex}` : '';
		// toggles are view state, not navigation — keep them out of history
		void goto(`?grid=${grid}&size=${size}${execParam}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function clearStored() {
		clearRuns(scenario.name, sizeKey);
		storedVersion++;
	}

	async function run(): Promise<Record<string, number>> {
		running = true;
		error = null;
		try {
			driver?.destroy();
			container.replaceChildren();
			driver = drivers[gridName]({
				compute: exec === 'main' ? 'main-thread' : exec === 'worker' ? 'worker' : 'hybrid',
				classes: theme.mechanism === 'classes' ? tailwindTheme : undefined,
				rowHeight: theme.rowHeight
			});
			const results = await scenario.run({ driver, el: container, size: SIZES[sizeKey] });
			if (gridName === 'speedy' && exec !== 'main') {
				const workerHeap = await measureWorkerHeapMB();
				if (workerHeap != null) results.workerHeapMB = workerHeap;
			}
			saveRun(scenario.name, sizeKey, gridName === 'speedy' ? speedyStoreKey : 'aggrid', results);
			storedVersion++;
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
		const handle = { name: scenario.name, grid: gridName, size: sizeKey, exec, run };
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

<header class:running aria-busy={running}>
	<a class="back" href="/">← All scenarios</a>
	<h1>{scenario.name}</h1>
	<p>{scenario.description}</p>
	<!-- fieldset: one attribute disables every nested control while a run is live -->
	<fieldset class="controls" disabled={running}>
		<div class="seg" role="radiogroup" aria-label="Grid under test">
			{#each GRIDS as g (g.id)}
				<label class="seg-option" class:active={gridName === g.id}>
					<input
						type="radio"
						name="grid"
						value={g.id}
						checked={gridName === g.id}
						onchange={() => select('grid', g.id)}
					/>
					<span>{g.label}</span>
				</label>
			{/each}
		</div>
		{#if gridName === 'speedy'}
			<div class="seg" role="radiogroup" aria-label="Compute">
				{#each [{ id: 'main', label: 'Main thread' }, { id: 'worker', label: 'Worker' }, { id: 'hybrid', label: 'Hybrid' }] as opt (opt.id)}
					<label class="seg-option" class:active={exec === opt.id}>
						<input
							type="radio"
							name="exec"
							value={opt.id}
							checked={exec === opt.id}
							onchange={() => select('exec', opt.id)}
						/>
						<span>{opt.label}</span>
					</label>
				{/each}
			</div>
		{/if}
		<div class="seg" role="radiogroup" aria-label="Row count">
			{#each Object.keys(SIZES) as key (key)}
				<label class="seg-option" class:active={sizeKey === key}>
					<input
						type="radio"
						name="size"
						value={key}
						checked={sizeKey === key}
						onchange={() => select('size', key)}
					/>
					<span>{key} rows</span>
				</label>
			{/each}
		</div>
		<button class="run" onclick={run} disabled={running}>
			{running ? 'Running…' : 'Run scenario'}
		</button>
		{#if anyStored}
			<button class="ghost" onclick={clearStored}>Clear results</button>
		{/if}
		{#if theme.id !== 'graphite'}
			<a class="theme-chip" href="/themes/{encodeURIComponent(theme.id)}" title="Picked in the theme gallery; applies to the SpeedyTables grid">
				theme: {theme.name}
			</a>
		{/if}
	</fieldset>
</header>

{#if error}
	<p class="error">{error}</p>
{/if}

{#if displayColumns.length > 0}
	{@const keys = metricKeys(...displayColumns.map((c) => c.run?.results))}
	<table class="compare">
		<thead>
			<tr>
				<th></th>
				{#each displayColumns as column (column.key)}
					<th class:current={column.key === currentVariant} class:pending={column.pending}>
						{column.label}
						{#if column.pending}
							<span class="when"><span class="spinner" aria-label="running"></span></span>
						{:else if column.run}
							<span class="when">{relativeTime(column.run.date)}</span>
						{/if}
					</th>
				{/each}
				<th class="delta-head" title="best SpeedyTables variant vs AG Grid">Δ</th>
			</tr>
		</thead>
		<tbody>
			{#each keys as key (key)}
				{@const values = displayColumns.map((c) => c.run?.results[key])}
				{@const present = values.filter((v) => v !== undefined)}
				{@const contested = new Set(present).size > 1}
				{@const best = contested ? bestOf(key, values) : null}
				{@const aggridValue = displayColumns.find((c) => c.key === 'aggrid')?.run?.results[key]}
				{@const bestSpeedy = bestOf(
					key,
					displayColumns.filter((c) => c.key !== 'aggrid').map((c) => c.run?.results[key])
				) ?? displayColumns.find((c) => c.key !== 'aggrid')?.run?.results[key]}
				{@const delta =
					aggridValue !== undefined && bestSpeedy !== undefined && bestSpeedy !== null
						? compareMetric(key, bestSpeedy, aggridValue)
						: null}
				<tr>
					<th>{key}</th>
					{#each displayColumns as column, i (column.key)}
						<td class:win={best !== null && values[i] === best} class:pending={column.pending}>
							{values[i] ?? '·'}
						</td>
					{/each}
					<td class="delta" data-winner={delta?.winner ?? 'tie'}>{delta?.label ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<div
	class="grid-host"
	data-speedy-theme={theme.mechanism === 'tokens' ? (theme.saved?.base ?? theme.id) : undefined}
	style={gridName === 'speedy'
		? `background:${theme.paneBg}; color-scheme:${theme.paneScheme}; ${overrideStyle}`
		: undefined}
	bind:this={container}
></div>

<style>
	header {
		padding: 0.75rem 1rem 0.25rem;
	}
	.back {
		display: inline-block;
		font-size: 12px;
		color: var(--app-ink-soft);
		text-decoration: none;
		margin-bottom: 2px;
	}
	.back:hover {
		color: var(--app-accent);
	}
	h1 {
		margin: 0;
		font-size: 1.25rem;
	}
	p {
		margin: 0.25rem 0 0.75rem;
		color: var(--app-ink-soft);
	}
	.error {
		color: oklch(0.72 0.19 25);
		padding: 0 1rem;
	}

	/* controls */
	.controls {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		border: none;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	/* the whole top section stands down while a run is live */
	header {
		transition: opacity 200ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	header.running {
		opacity: 0.45;
		pointer-events: none;
	}
	header.running .run {
		opacity: 1; /* keep the 'Running…' label readable as the status cue */
	}
	@media (prefers-reduced-motion: reduce) {
		header {
			transition: none;
		}
	}
	.seg {
		display: flex;
		padding: 2px;
		background: oklch(0.22 0.012 255);
		border: 1px solid oklch(0.3 0.012 255);
		border-radius: 7px;
	}
	.seg-option {
		position: relative;
		cursor: pointer;
	}
	.seg-option input {
		position: absolute;
		opacity: 0;
		inset: 0;
		cursor: pointer;
	}
	.seg-option span {
		display: block;
		padding: 3px 12px;
		border-radius: 5px;
		font-size: 12.5px;
		line-height: 20px;
		color: var(--app-ink-soft);
		transition: background-color 150ms cubic-bezier(0.165, 0.84, 0.44, 1), color 150ms cubic-bezier(0.165, 0.84, 0.44, 1);
		white-space: nowrap;
	}
	.seg-option:hover span {
		color: var(--app-ink);
	}
	.seg-option.active span {
		background: var(--app-accent);
		color: oklch(0.14 0.015 255);
		font-weight: 600;
	}
	.seg-option input:focus-visible + span {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.72 0.1 220 / 0.45);
	}
	.run {
		padding: 4px 16px;
		border: 1px solid oklch(0.45 0.02 220);
		border-radius: 7px;
		background: oklch(0.28 0.045 220);
		color: var(--app-ink);
		font: inherit;
		font-size: 12.5px;
		font-weight: 600;
		line-height: 20px;
		cursor: pointer;
		transition: background-color 150ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.run:hover:not(:disabled) {
		background: oklch(0.33 0.055 220);
	}
	.run:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.run:focus-visible,
	.ghost:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.72 0.1 220 / 0.45);
	}
	.ghost {
		padding: 4px 10px;
		border: none;
		border-radius: 7px;
		background: transparent;
		color: var(--app-ink-soft);
		font: inherit;
		font-size: 12px;
		line-height: 20px;
		cursor: pointer;
	}
	.ghost:hover {
		color: var(--app-ink);
		background: oklch(0.24 0.012 255);
	}
	.theme-chip {
		font-size: 11.5px;
		line-height: 20px;
		padding: 3px 10px;
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 99px;
		color: var(--app-ink-soft);
		text-decoration: none;
	}
	.theme-chip:hover {
		color: var(--app-ink);
		border-color: oklch(0.45 0.06 220);
	}
	.theme-chip:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.72 0.1 220 / 0.45);
	}

	/* comparison table */
	.compare {
		margin: 0.75rem 1rem 0.25rem;
		border-collapse: collapse;
		font-size: 12.5px;
		font-variant-numeric: tabular-nums;
	}
	.compare th,
	.compare td {
		padding: 3px 14px 3px 0;
		text-align: right;
		border-bottom: 1px solid oklch(0.26 0.01 255);
	}
	.compare tbody th {
		text-align: left;
		font-weight: 400;
		color: var(--app-ink-soft);
		padding-right: 20px;
	}
	.compare thead th {
		font-weight: 600;
		padding-bottom: 5px;
		color: var(--app-ink-soft);
	}
	.compare thead th.current {
		color: var(--app-ink);
	}
	.when {
		display: block;
		font-weight: 400;
		font-size: 10.5px;
		color: oklch(0.55 0.015 250);
	}
	.compare td.win {
		color: oklch(0.82 0.14 150);
		background: oklch(0.26 0.035 150 / 0.35);
		font-weight: 600;
	}
	.compare .delta,
	.compare .delta-head {
		padding-right: 0;
		color: oklch(0.55 0.015 250);
		font-size: 11.5px;
	}
	.compare .delta[data-winner='speedy'],
	.compare .delta[data-winner='aggrid'] {
		color: oklch(0.75 0.1 150);
	}
	.compare td.pending {
		opacity: 0.35;
		transition: opacity 200ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.compare th.pending {
		color: var(--app-ink);
	}
	.spinner {
		display: inline-block;
		width: 11px;
		height: 11px;
		border: 2px solid oklch(0.35 0.03 220);
		border-top-color: var(--app-accent);
		border-radius: 50%;
		vertical-align: -2px;
		animation: st-spin 700ms linear infinite;
	}
	@keyframes st-spin {
		to {
			rotate: 1turn;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
		.compare td.pending {
			transition: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.seg-option span,
		.run {
			transition: none;
		}
	}
	.grid-host {
		height: 600px;
		margin: 0.5rem 1rem;
	}

</style>
