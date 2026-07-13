<script lang="ts">
	import type { EditorState } from '$lib/editor/state.svelte';
	import { decodeDraft } from '$lib/editor/saved';

	let { editor, themeName }: { editor: EditorState; themeName: string } = $props();

	let dialog = $state<HTMLDialogElement>();
	let tab = $state<'css' | 'json' | 'import'>('css');
	let copied = $state(false);
	let importText = $state('');
	let importError = $state('');

	export function open() {
		tab = 'css';
		copied = false;
		dialog?.showModal();
	}

	const css = $derived(editor.exportCss(themeName));
	const json = $derived(JSON.stringify(editor.draft(), null, 2));

	async function copy() {
		await navigator.clipboard.writeText(tab === 'css' ? css : json);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function runImport() {
		importError = '';
		try {
			const parsed = JSON.parse(importText);
			editor.loadDraft({
				base: parsed.base ?? 'graphite',
				overrides: parsed.overrides ?? {},
				rowHeight: parsed.rowHeight ?? 32
			});
			dialog?.close();
		} catch {
			const decoded = decodeDraft(importText.replace(/^.*#d=/, '').trim());
			if (decoded) {
				editor.loadDraft(decoded);
				dialog?.close();
			} else {
				importError = 'Not valid theme JSON or a share link.';
			}
		}
	}
</script>

<dialog bind:this={dialog} closedby="any">
	<header>
		<h2>Theme code</h2>
		<button type="button" class="close" aria-label="Close" onclick={() => dialog?.close()}>×</button>
	</header>
	<div class="tabs" role="tablist">
		{#each [['css', 'CSS'], ['json', 'JSON'], ['import', 'Import']] as [id, label] (id)}
			<button
				type="button"
				role="tab"
				aria-selected={tab === id}
				class:active={tab === id}
				onclick={() => (tab = id as typeof tab)}>{label}</button
			>
		{/each}
		{#if tab !== 'import'}
			<button type="button" class="copy" onclick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
		{/if}
	</div>
	{#if tab === 'import'}
		<textarea
			bind:value={importText}
			placeholder="Paste theme JSON or a share link…"
			spellcheck="false"
		></textarea>
		{#if importError}<p class="error">{importError}</p>{/if}
		<button type="button" class="run" onclick={runImport}>Load into editor</button>
	{:else}
		<pre>{tab === 'css' ? css : json}</pre>
	{/if}
</dialog>

<style>
	dialog {
		width: min(680px, 92vw);
		max-height: 84vh;
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 10px;
		background: oklch(0.19 0.012 255);
		color: var(--app-ink);
		padding: 1rem 1.1rem;
	}
	dialog::backdrop {
		background: oklch(0 0 0 / 0.55);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.6rem;
	}
	h2 {
		margin: 0;
		font-size: 1rem;
	}
	.close {
		border: none;
		background: transparent;
		color: var(--app-ink-soft);
		font-size: 18px;
		cursor: pointer;
		border-radius: 5px;
		padding: 0 6px;
	}
	.close:hover {
		color: var(--app-ink);
		background: oklch(0.26 0.012 255);
	}
	.tabs {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 0.6rem;
	}
	.tabs [role='tab'] {
		border: none;
		background: transparent;
		color: var(--app-ink-soft);
		font-size: 12.5px;
		padding: 4px 10px;
		border-radius: 6px;
		cursor: pointer;
	}
	.tabs [role='tab'].active {
		background: oklch(0.27 0.03 220);
		color: var(--app-ink);
	}
	.copy {
		margin-left: auto;
		border: 1px solid oklch(0.4 0.05 220);
		background: oklch(0.27 0.045 220);
		color: var(--app-ink);
		font-size: 12px;
		padding: 3px 12px;
		border-radius: 6px;
		cursor: pointer;
	}
	.copy:hover {
		background: oklch(0.31 0.05 220);
	}
	pre {
		margin: 0;
		max-height: 55vh;
		overflow: auto;
		background: oklch(0.155 0.01 255);
		border: 1px solid oklch(0.28 0.012 255);
		border-radius: 8px;
		padding: 0.8rem;
		font: 11.5px ui-monospace, monospace;
		line-height: 1.55;
		white-space: pre;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
		height: 180px;
		background: oklch(0.155 0.01 255);
		border: 1px solid oklch(0.28 0.012 255);
		border-radius: 8px;
		color: var(--app-ink);
		font: 11.5px ui-monospace, monospace;
		padding: 0.6rem;
		resize: vertical;
	}
	.error {
		color: oklch(0.72 0.19 25);
		font-size: 12px;
		margin: 0.4rem 0 0;
	}
	.run {
		margin-top: 0.6rem;
		border: 1px solid oklch(0.4 0.05 220);
		background: oklch(0.27 0.045 220);
		color: var(--app-ink);
		font-size: 12.5px;
		padding: 5px 14px;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
