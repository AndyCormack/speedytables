<script lang="ts">
	import '@speedytables/svelte/themes/base.css';
	import '@speedytables/svelte/themes/graphite.css';
	import '@speedytables/svelte/themes/porcelain.css';
	import '@speedytables/svelte/themes/oxide.css';
	import '@speedytables/svelte/themes/ledger.css';
	import '@speedytables/svelte/themes/aurora.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { TOKENS, type TokenGroup } from '@speedytables/svelte';
	import SpeedyHarness from '$lib/drivers/SpeedyHarness.svelte';
	import { generateTrades } from '$lib/dataset';
	import { TRADE_COLUMNS } from '$lib/scenarios/columns';
	import { THEMES } from '$lib/themes';
	import { EditorState } from '$lib/editor/state.svelte';
	import { probeTheme } from '$lib/editor/probe';
	import { deleteTheme, getSaved, listSaved, saveTheme, decodeDraft } from '$lib/editor/saved';
	import TokenControl from './TokenControl.svelte';
	import CodeDialog from './CodeDialog.svelte';

	const tokenThemes = THEMES.filter((t) => t.mechanism === 'tokens');

	const editor = new EditorState();
	const rows = generateTrades(10_000) as unknown as Record<string, unknown>[];

	let quickPicks = $state<string[]>([]);
	let dots = $state<Record<string, string[]>>({});
	let savedVersion = $state(0);
	const saved = $derived.by(() => {
		void savedVersion;
		return listSaved();
	});

	let saveName = $state('');
	let shareNote = $state('');
	let codeDialog = $state<{ open(): void }>();
	let harness = $state<{ getGrid(): { setSortModel(m: unknown[]): Promise<void> } }>();

	// base values follow the picked base theme via the computed-style probe
	$effect(() => {
		const probed = probeTheme(editor.base);
		editor.baseValues = probed.tokens;
		editor.baseColorScheme = probed.colorScheme;
	});

	// a visible sort keeps accent states honest in the preview
	$effect(() => {
		void editor.base;
		void editor.rowHeight;
		void harness?.getGrid().setSortModel([{ columnId: 'price', dir: 'desc' }]);
	});

	onMount(() => {
		// quick-picks + picker dots harvested from the shipped themes
		const colorNames = new Set<string>(TOKENS.filter((t) => t.kind === 'color').map((t) => t.name));
		const picks = new Set<string>();
		const dotMap: Record<string, string[]> = {};
		for (const theme of tokenThemes) {
			const { tokens } = probeTheme(theme.id);
			dotMap[theme.id] = ['--st-bg', '--st-surface', '--st-accent', '--st-ink'].map((n) => tokens[n]!);
			for (const [name, value] of Object.entries(tokens)) {
				if (colorNames.has(name) && value.startsWith('oklch')) picks.add(value);
			}
		}
		dots = dotMap;
		quickPicks = [...picks].slice(0, 40);

		// entry points: ?load=<saved name> or a #d= share link
		const load = page.url.searchParams.get('load');
		const hash = location.hash.match(/#d=(.+)/)?.[1];
		if (load) {
			const savedTheme = getSaved(load);
			if (savedTheme) {
				editor.loadDraft(savedTheme);
				saveName = savedTheme.name;
			}
		} else if (hash) {
			const draft = decodeDraft(hash);
			if (draft) editor.loadDraft(draft);
		}
	});

	function onkeydown(e: KeyboardEvent) {
		if (!(e.ctrlKey || e.metaKey)) return;
		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
		if (e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			editor.undo();
		} else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
			e.preventDefault();
			editor.redo();
		}
	}

	function share() {
		history.replaceState(null, '', editor.shareHash());
		void navigator.clipboard.writeText(location.href);
		shareNote = 'Link copied';
		setTimeout(() => (shareNote = ''), 1500);
	}

	function doSave() {
		const name = saveName.trim();
		if (!name) return;
		saveTheme(name, editor.draft());
		savedVersion++;
		shareNote = `Saved “${name}”`;
		setTimeout(() => (shareNote = ''), 1500);
	}

	let query = $state('');
	const GROUPS: { id: TokenGroup; label: string }[] = [
		{ id: 'surface', label: 'Surfaces' },
		{ id: 'ink', label: 'Ink' },
		{ id: 'border', label: 'Borders' },
		{ id: 'accent', label: 'Accent' },
		{ id: 'shape', label: 'Shape' },
		{ id: 'density', label: 'Density' },
		{ id: 'motion', label: 'Motion' }
	];
	const visibleTokens = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return TOKENS.filter(
			(t) => !q || t.name.includes(q) || t.description.toLowerCase().includes(q)
		);
	});
</script>

<svelte:window {onkeydown} />

<svelte:head>
	<title>Theme editor · SpeedyTables</title>
</svelte:head>

<div class="shell">
	<header class="topbar">
		<a class="back" href="/themes/{editor.base}">← Themes</a>

		<div class="picker-wrap">
			<button type="button" class="base-btn" popovertarget="base-picker">
				<span class="dots">
					{#each dots[editor.base] ?? [] as dot (dot)}<i style="background:{dot};"></i>{/each}
				</span>
				{tokenThemes.find((t) => t.id === editor.base)?.name ?? editor.base}{editor.dirty ? '*' : ''}
				<span class="chev">▾</span>
			</button>
			<div id="base-picker" popover="auto" class="base-panel">
				<p class="section">Built-in</p>
				{#each tokenThemes as theme (theme.id)}
					<button
						type="button"
						class="base-entry"
						class:active={theme.id === editor.base}
						onclick={() => editor.switchBase(theme.id)}
					>
						<span class="dots">
							{#each dots[theme.id] ?? [] as dot (dot)}<i style="background:{dot};"></i>{/each}
						</span>
						{theme.name}
					</button>
				{/each}
				{#if saved.length}
					<p class="section">Yours</p>
					{#each saved as theme (theme.name)}
						<div class="base-entry saved">
							<button type="button" class="load" onclick={() => { editor.loadDraft(theme); saveName = theme.name; }}>
								{theme.name}
							</button>
							<button
								type="button"
								class="del"
								aria-label="Delete {theme.name}"
								onclick={() => { deleteTheme(theme.name); savedVersion++; }}>×</button
							>
						</div>
					{/each}
				{/if}
				<p class="note">The Tailwind preset is class-based and edited in code, not here.</p>
			</div>
		</div>

		<div class="rowh">
			<span>Row height</span>
			<button type="button" onclick={() => editor.setRowHeight(editor.rowHeight - 2)} aria-label="Decrease row height">−</button>
			<b>{editor.rowHeight}</b>
			<button type="button" onclick={() => editor.setRowHeight(editor.rowHeight + 2)} aria-label="Increase row height">+</button>
		</div>

		<div class="actions">
			{#if shareNote}<span class="note-flash" role="status">{shareNote}</span>{/if}
			<button type="button" disabled={!editor.canUndo} onclick={() => editor.undo()} title="Undo (Ctrl+Z)">↺</button>
			<button type="button" disabled={!editor.canRedo} onclick={() => editor.redo()} title="Redo (Ctrl+Y)">↻</button>
			<button type="button" disabled={!editor.dirty} onclick={() => editor.reset()}>Reset</button>
			<button type="button" onclick={share}>Share</button>
			<div class="save-wrap">
				<button type="button" popovertarget="save-pop">Save</button>
				<div id="save-pop" popover="auto" class="save-panel">
					<label for="save-name">Theme name</label>
					<input id="save-name" type="text" bind:value={saveName} placeholder="my-theme" />
					<button type="button" class="confirm" disabled={!saveName.trim()} onclick={doSave}>Save locally</button>
				</div>
			</div>
			<button type="button" class="primary" onclick={() => codeDialog?.open()}>Code</button>
		</div>
	</header>

	<div class="body">
		<aside>
			<input class="search" type="search" placeholder="Search tokens…" bind:value={query} />
			{#each GROUPS as group (group.id)}
				{@const tokens = visibleTokens.filter((t) => t.group === group.id)}
				{#if tokens.length}
					<details open>
						<summary>{group.label}</summary>
						{#each tokens as token (token.name)}
							<TokenControl {token} {editor} {quickPicks} />
						{/each}
					</details>
				{/if}
			{/each}
		</aside>

		<main class="pane" style="color-scheme:{editor.baseColorScheme};">
			{#key `${editor.base}:${editor.rowHeight}`}
				<div class="stage" data-speedy-theme={editor.base} style={editor.styleString}>
					<SpeedyHarness
						bind:this={harness}
						columns={TRADE_COLUMNS}
						{rows}
						rowHeight={editor.rowHeight}
						compute="main-thread"
					/>
				</div>
			{/key}
		</main>
	</div>
</div>

<CodeDialog bind:this={codeDialog} {editor} themeName={saveName || 'custom'} />

<style>
	.shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
	}
	.topbar {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 8px 14px;
		border-bottom: 1px solid oklch(0.28 0.012 255);
	}
	.back {
		font-size: 12px;
		color: var(--app-ink-soft);
		text-decoration: none;
	}
	.back:hover {
		color: var(--app-accent);
	}
	.dots {
		display: inline-flex;
		gap: 3px;
	}
	.dots i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1px solid oklch(0.4 0.012 255);
	}
	.base-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		border: 1px solid oklch(0.32 0.012 255);
		background: oklch(0.22 0.012 255);
		color: var(--app-ink);
		font-size: 13px;
		font-weight: 600;
		padding: 5px 12px;
		border-radius: 7px;
		cursor: pointer;
	}
	.base-btn:hover {
		border-color: var(--app-accent);
	}
	.chev {
		color: var(--app-ink-soft);
		font-size: 10px;
	}
	.base-panel,
	.save-panel {
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 8px;
		background: oklch(0.21 0.012 255);
		color: var(--app-ink);
		padding: 8px;
		min-width: 230px;
		box-shadow: 0 8px 28px oklch(0 0 0 / 0.5);
	}
	.section {
		margin: 4px 6px;
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--app-ink-soft);
	}
	.base-entry {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		border: none;
		background: transparent;
		color: var(--app-ink);
		font-size: 12.5px;
		text-align: left;
		padding: 6px 8px;
		border-radius: 6px;
		cursor: pointer;
	}
	.base-entry:hover {
		background: oklch(0.26 0.012 255);
	}
	.base-entry.active {
		background: oklch(0.26 0.035 220);
	}
	.base-entry.saved {
		padding: 0;
	}
	.base-entry.saved .load {
		flex: 1;
		border: none;
		background: transparent;
		color: var(--app-ink);
		font-size: 12.5px;
		text-align: left;
		padding: 6px 8px;
		cursor: pointer;
	}
	.base-entry.saved .del {
		border: none;
		background: transparent;
		color: var(--app-ink-soft);
		cursor: pointer;
		padding: 0 8px;
		font-size: 14px;
	}
	.base-entry.saved .del:hover {
		color: oklch(0.72 0.19 25);
	}
	.note {
		margin: 6px 6px 2px;
		font-size: 10.5px;
		color: oklch(0.55 0.015 250);
	}
	.rowh {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--app-ink-soft);
	}
	.rowh b {
		color: var(--app-ink);
		min-width: 20px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
	.rowh button {
		width: 22px;
		height: 22px;
		border: 1px solid oklch(0.32 0.012 255);
		background: oklch(0.22 0.012 255);
		color: var(--app-ink);
		border-radius: 5px;
		cursor: pointer;
	}
	.actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.actions button {
		border: 1px solid oklch(0.32 0.012 255);
		background: oklch(0.22 0.012 255);
		color: var(--app-ink);
		font-size: 12.5px;
		padding: 5px 11px;
		border-radius: 7px;
		cursor: pointer;
	}
	.actions button:hover:not(:disabled) {
		border-color: var(--app-accent);
	}
	.actions button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.actions .primary {
		background: oklch(0.28 0.045 220);
		border-color: oklch(0.42 0.05 220);
		font-weight: 600;
	}
	.note-flash {
		font-size: 12px;
		color: var(--app-accent);
	}
	.save-wrap {
		position: relative;
	}
	.save-panel label {
		display: block;
		font-size: 11px;
		color: var(--app-ink-soft);
		margin-bottom: 4px;
	}
	.save-panel input {
		width: 100%;
		box-sizing: border-box;
		background: oklch(0.17 0.01 255);
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 6px;
		color: var(--app-ink);
		font-size: 12.5px;
		padding: 5px 8px;
		margin-bottom: 8px;
	}
	.save-panel .confirm {
		width: 100%;
		border: 1px solid oklch(0.42 0.05 220);
		background: oklch(0.28 0.045 220);
		color: var(--app-ink);
		font-size: 12.5px;
		padding: 5px 0;
		border-radius: 6px;
		cursor: pointer;
	}
	.save-panel .confirm:disabled {
		opacity: 0.4;
	}

	.body {
		display: grid;
		grid-template-columns: 320px 1fr;
		flex: 1;
		min-height: 0;
	}
	aside {
		border-right: 1px solid oklch(0.28 0.012 255);
		overflow-y: auto;
		padding: 10px 14px 20px;
	}
	.search {
		width: 100%;
		box-sizing: border-box;
		background: oklch(0.2 0.012 255);
		border: 1px solid oklch(0.3 0.012 255);
		border-radius: 7px;
		color: var(--app-ink);
		font-size: 12.5px;
		padding: 6px 10px;
		margin-bottom: 8px;
	}
	.search:focus-visible {
		outline: none;
		border-color: var(--app-accent);
	}
	details {
		border-bottom: 1px solid oklch(0.25 0.01 255);
		padding: 4px 0 8px;
	}
	summary {
		cursor: pointer;
		font-size: 11.5px;
		font-weight: 650;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--app-ink-soft);
		padding: 6px 0;
		user-select: none;
	}
	summary:hover {
		color: var(--app-ink);
	}
	.pane {
		padding: 1.1rem;
		overflow: hidden;
		background: oklch(0.13 0.008 255);
	}
	.stage {
		height: 100%;
	}
</style>
