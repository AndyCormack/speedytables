<script lang="ts">
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
			driver = drivers[gridName](
				gridName === 'speedy'
					? { compute: exec === 'main' ? 'main-thread' : exec === 'worker' ? 'worker' : 'hybrid' }
					: undefined
			);
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

<div class="grid-host" bind:this={container}></div>

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

	/*
	 * SpeedyTables demo theme — styles the headless components via data attributes.
	 * Tokens: restrained strategy; steel-teal accent carries selection/state only.
	 * (Captured in DESIGN.md.)
	 */
	.grid-host {
		--st-ink: oklch(0.93 0.005 250);
		--st-ink-soft: oklch(0.72 0.015 250);
		--st-bg: oklch(0.195 0.012 255);
		--st-surface: oklch(0.235 0.012 255);
		--st-surface-hover: oklch(0.275 0.014 255);
		--st-border: oklch(0.29 0.012 255);
		--st-border-strong: oklch(0.38 0.015 255);
		--st-accent: oklch(0.72 0.1 220);
		--st-accent-tint: oklch(0.3 0.05 220);
		--st-radius: 4px;
		--st-focus-ring: 0 0 0 2px oklch(0.72 0.1 220 / 0.35);
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
	.grid-host :global([data-speedy-header-top]) {
		display: flex;
		align-items: center;
	}
	.grid-host :global([data-speedy-header-label]) {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
		min-width: 0;
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
	.grid-host :global([data-speedy-colmenu-trigger]) {
		flex: none;
		width: 20px;
		height: 24px;
		margin-right: 6px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--st-ink-soft);
		font: inherit;
		cursor: pointer;
		opacity: 0;
		transition: opacity 150ms var(--st-ease);
	}
	.grid-host :global([data-speedy-header-cell]:hover [data-speedy-colmenu-trigger]),
	.grid-host :global([data-speedy-colmenu-trigger]:focus-visible) {
		opacity: 1;
	}
	.grid-host :global([data-speedy-colmenu-trigger]:hover) {
		background: var(--st-surface-hover);
		color: var(--st-ink);
	}
	.grid-host :global([data-speedy-resize-handle]) {
		position: absolute;
		top: 0;
		right: 0;
		width: 7px;
		height: 100%;
		cursor: col-resize;
		touch-action: none;
	}
	.grid-host :global([data-speedy-resize-handle]:hover),
	.grid-host :global([data-speedy-resize-handle]:active) {
		background: linear-gradient(to right, transparent 4px, var(--st-accent) 4px);
	}
	:global([data-speedy-menu-item]) {
		display: block;
		width: 100%;
		text-align: left;
		padding: 5px 8px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 12px;
		cursor: pointer;
		white-space: nowrap;
	}
	:global([data-speedy-menu-item]:hover) {
		background: oklch(0.275 0.014 255);
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

	/* enum + column-menu panels — rendered in the top layer via the Popover API */
	:global([data-speedy-enum-panel]),
	:global([data-speedy-menu-panel]) {
		border: 1px solid oklch(0.38 0.015 255);
		border-radius: 6px;
		background: oklch(0.235 0.012 255);
		color: oklch(0.93 0.005 250);
		font-size: 12px;
		padding: 4px;
		box-shadow:
			0 2px 6px oklch(0 0 0 / 0.3),
			0 8px 24px oklch(0 0 0 / 0.45);
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
		:global([data-speedy-enum-panel]:popover-open),
		:global([data-speedy-menu-panel]:popover-open) {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global([data-speedy-enum-panel]),
		:global([data-speedy-menu-panel]) {
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
		border-bottom: 1px solid oklch(0.29 0.012 255);
		margin-bottom: 4px;
		font-weight: 600;
	}
	:global([data-speedy-enum-reset]) {
		border: none;
		background: transparent;
		font: inherit;
		font-size: 11px;
		color: oklch(0.72 0.1 220);
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 4px;
	}
	:global([data-speedy-enum-reset]:hover:not(:disabled)) {
		background: oklch(0.3 0.05 220);
	}
	:global([data-speedy-enum-reset]:disabled) {
		color: oklch(0.5 0.01 250);
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
		background: oklch(0.275 0.014 255);
	}
	:global([data-speedy-enum-option] input) {
		accent-color: oklch(0.72 0.1 220);
		margin: 0;
	}
</style>
