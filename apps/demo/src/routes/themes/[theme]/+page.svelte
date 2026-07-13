<script lang="ts">
	import '@speedytables/svelte/themes/base.css';
	import '@speedytables/svelte/themes/graphite.css';
	import '@speedytables/svelte/themes/porcelain.css';
	import '@speedytables/svelte/themes/oxide.css';
	import '@speedytables/svelte/themes/ledger.css';
	import '@speedytables/svelte/themes/aurora.css';
	import '$lib/tailwind-utilities.css';
	import { tailwindTheme } from '@speedytables/svelte/themes/tailwind';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SpeedyHarness from '$lib/drivers/SpeedyHarness.svelte';
	import { generateTrades } from '$lib/dataset';
	import { TRADE_COLUMNS } from '$lib/scenarios/columns';
	import { setPickedTheme, THEMES } from '$lib/themes';
	import { listSaved, type SavedTheme } from '$lib/editor/saved';

	const { data } = $props();
	const theme = $derived(data.theme);

	let savedThemes = $state<SavedTheme[]>([]);
	onMount(() => (savedThemes = listSaved()));

	const overrideStyle = $derived(
		theme.saved
			? Object.entries(theme.saved.overrides)
					.map(([k, v]) => `${k}: ${v}`)
					.join('; ')
			: ''
	);

	const rows = generateTrades(10_000) as unknown as Record<string, unknown>[];

	let harness = $state<{ getGrid(): { setSortModel(m: unknown[]): Promise<void> } }>();

	// a sorted column makes accent states visible in every theme at a glance
	$effect(() => {
		void theme.id;
		void harness?.getGrid().setSortModel([{ columnId: 'price', dir: 'desc' }]);
	});

	// viewing a theme picks it: the scenario pages follow the pick
	$effect(() => setPickedTheme(theme.id));

	function pick(id: string) {
		// flicking through themes is view state, not navigation
		void goto(`/themes/${id}`, { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>{theme.name} · SpeedyTables themes</title>
</svelte:head>

<div class="shell">
	<aside>
		<a class="back" href="/">← All scenarios</a>
		<h1>Themes</h1>
		<p class="sub">
			Five token themes and one Tailwind part-class preset over the same headless grid. Flick
			through — the pane swaps in place.
		</p>
		<nav aria-label="Themes">
			{#each THEMES as entry (entry.id)}
				<a
					href="/themes/{entry.id}"
					class="entry"
					class:active={entry.id === theme.id}
					aria-current={entry.id === theme.id ? 'page' : undefined}
					onclick={(e) => {
						e.preventDefault();
						pick(entry.id);
					}}
				>
					<span class="name">
						{entry.name}
						{#if entry.mechanism === 'classes'}<span class="mech">classes</span>{/if}
					</span>
					<span class="blurb">{entry.blurb}</span>
				</a>
			{/each}
			{#if savedThemes.length}
				<p class="yours-label">Yours</p>
				{#each savedThemes as savedTheme (savedTheme.name)}
					<div class="entry saved-entry" class:active={savedTheme.name === theme.id}>
						<a
							class="saved-link"
							href="/themes/{savedTheme.name}"
							aria-current={savedTheme.name === theme.id ? 'page' : undefined}
							onclick={(e) => {
								e.preventDefault();
								pick(savedTheme.name);
							}}
						>
							<span class="name">{savedTheme.name}</span>
							<span class="blurb">Custom, based on {savedTheme.base}.</span>
						</a>
						<a class="edit" href="/themes/editor?load={savedTheme.name}">edit</a>
					</div>
				{/each}
			{/if}
		</nav>
		<a class="build" href="/themes/editor">Build your own theme →</a>
		<p class="foot">
			Tokens are a documented contract — see <code>themes/tokens.ts</code>.
		</p>
	</aside>

	<main
		class="pane"
		data-scheme={theme.paneScheme}
		style="background:{theme.paneBg}; color-scheme:{theme.paneScheme};"
	>
		{#key theme.id}
			<div
				class="stage"
				data-speedy-theme={theme.saved
					? theme.saved.base
					: theme.mechanism === 'tokens'
						? theme.id
						: undefined}
				style={overrideStyle}
			>
				<SpeedyHarness
					bind:this={harness}
					columns={TRADE_COLUMNS}
					{rows}
					rowHeight={theme.rowHeight}
					compute="main-thread"
					classes={theme.mechanism === 'classes' ? tailwindTheme : undefined}
				/>
			</div>
		{/key}
	</main>
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: 280px 1fr;
		height: 100dvh;
		overflow: hidden;
	}
	aside {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1.1rem 1.2rem;
		border-right: 1px solid oklch(0.28 0.012 255);
		overflow-y: auto;
	}
	.back {
		font-size: 12px;
		color: var(--app-ink-soft);
		text-decoration: none;
	}
	.back:hover {
		color: var(--app-accent);
	}
	h1 {
		margin: 0.1rem 0 0;
		font-size: 1.25rem;
	}
	.sub {
		margin: 0.2rem 0 0.9rem;
		font-size: 0.78rem;
		line-height: 1.5;
		color: var(--app-ink-soft);
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.entry {
		display: block;
		padding: 0.55rem 0.7rem;
		border-radius: 7px;
		text-decoration: none;
		color: inherit;
		border: 1px solid transparent;
		transition: background-color 150ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.entry:hover {
		background: oklch(0.22 0.012 255);
	}
	.entry:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.72 0.1 220 / 0.45);
	}
	.entry.active {
		background: oklch(0.24 0.03 220);
		border-color: oklch(0.45 0.06 220);
	}
	.name {
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
		font-size: 0.85rem;
	}
	.mech {
		font-size: 0.62rem;
		font-weight: 500;
		padding: 1px 6px;
		border-radius: 99px;
		background: oklch(0.3 0.05 220);
		color: oklch(0.85 0.05 220);
	}
	.blurb {
		display: block;
		margin-top: 2px;
		font-size: 0.73rem;
		line-height: 1.45;
		color: var(--app-ink-soft);
	}
	.yours-label {
		margin: 10px 6px 4px;
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--app-ink-soft);
	}
	.saved-entry {
		display: flex;
		align-items: flex-start;
		gap: 6px;
	}
	.saved-link {
		flex: 1;
		min-width: 0;
		text-decoration: none;
		color: inherit;
	}
	.edit {
		flex: none;
		font-size: 0.68rem;
		font-weight: 500;
		color: var(--app-accent);
		text-decoration: none;
		padding-top: 2px;
	}
	.edit:hover {
		text-decoration: underline;
	}
	.build {
		display: block;
		margin-top: 0.9rem;
		padding: 0.5rem 0.7rem;
		border: 1px solid oklch(0.4 0.05 220);
		border-radius: 7px;
		background: oklch(0.24 0.035 220);
		color: var(--app-ink);
		font-size: 0.8rem;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
	}
	.build:hover {
		background: oklch(0.28 0.045 220);
	}
	.foot {
		margin-top: auto;
		padding-top: 1rem;
		font-size: 0.7rem;
		color: oklch(0.55 0.015 250);
	}
	.foot code {
		background: oklch(0.22 0.012 255);
		padding: 1px 4px;
		border-radius: 4px;
		font-size: 0.68rem;
	}
	.pane {
		padding: 1.25rem;
		overflow: hidden;
		transition: background-color 200ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.stage {
		height: 100%;
	}
	@media (prefers-reduced-motion: reduce) {
		.entry,
		.pane {
			transition: none;
		}
	}
</style>
