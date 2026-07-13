<script lang="ts">
	import type { TokenSpec } from '@speedytables/svelte';
	import type { EditorState } from '$lib/editor/state.svelte';
	import ColorControl from './ColorControl.svelte';

	let {
		token,
		editor,
		quickPicks
	}: { token: TokenSpec; editor: EditorState; quickPicks: string[] } = $props();

	const uid = $props.id();
	const value = $derived(editor.value(token.name));

	/** Slider support for simple lengths; anything else edits as text. */
	const length = $derived.by(() => {
		const m = value.trim().match(/^([\d.]+)(px|em|rem)?$/);
		if (!m) return null;
		const unit = m[2] ?? (token.name.includes('tracking') ? 'em' : 'px');
		const ranges: Record<string, { max: number; step: number }> = {
			px: { max: 32, step: 1 },
			em: { max: 0.2, step: 0.005 },
			rem: { max: 2, step: 0.05 }
		};
		return { num: parseFloat(m[1]!), unit, ...ranges[unit]! };
	});

	const EASINGS = [
		'cubic-bezier(0.165, 0.84, 0.44, 1)',
		'cubic-bezier(0.23, 1, 0.32, 1)',
		'cubic-bezier(0.19, 1, 0.22, 1)',
		'ease',
		'ease-in-out',
		'linear'
	];
</script>

{#if token.kind === 'color'}
	<ColorControl {token} {editor} {quickPicks} />
{:else}
	<div class="control" class:overridden={editor.isOverridden(token.name)}>
		<div class="meta">
			<label for="{uid}-in">{token.name.replace('--st-', '')}</label>
			<div class="row">
				{#if token.kind === 'length' && length}
					<input
						type="range"
						min="0"
						max={length.max}
						step={length.step}
						value={length.num}
						aria-label="{token.name} slider"
						oninput={(e) => editor.setToken(token.name, `${e.currentTarget.value}${length.unit === 'px' ? 'px' : length.unit}`)}
					/>
				{/if}
				{#if token.kind === 'weight'}
					<input
						type="range"
						min="300"
						max="800"
						step="25"
						{value}
						aria-label="{token.name} slider"
						oninput={(e) => editor.setToken(token.name, e.currentTarget.value)}
					/>
				{/if}
				{#if token.kind === 'easing'}
					<select
						aria-label="{token.name} presets"
						onchange={(e) => e.currentTarget.value && editor.setToken(token.name, e.currentTarget.value)}
					>
						<option value="">preset…</option>
						{#each EASINGS as easing (easing)}
							<option value={easing} selected={easing === value}>{easing}</option>
						{/each}
					</select>
				{/if}
				<input
					id="{uid}-in"
					class="text"
					type="text"
					spellcheck="false"
					{value}
					onchange={(e) => editor.setToken(token.name, e.currentTarget.value)}
				/>
				{#if token.kind === 'shadow'}
					<span class="shadow-chip" style="box-shadow:{value};" aria-hidden="true"></span>
				{/if}
			</div>
		</div>
		{#if editor.isOverridden(token.name)}
			<button
				type="button"
				class="revert"
				title="Revert to base"
				aria-label="Revert {token.name} to base"
				onclick={() => editor.clearToken(token.name)}>↺</button
			>
		{/if}
	</div>
{/if}

<style>
	.control {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		padding: 3px 0;
	}
	.meta {
		flex: 1;
		min-width: 0;
	}
	label {
		display: block;
		font-size: 10.5px;
		color: var(--app-ink-soft);
	}
	.control.overridden label {
		color: var(--app-accent);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	input[type='range'] {
		flex: 1;
		min-width: 60px;
		accent-color: var(--app-accent);
	}
	.text {
		flex: 1.4;
		min-width: 0;
		box-sizing: border-box;
		background: oklch(0.2 0.012 255);
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 5px;
		color: var(--app-ink);
		font: 11px ui-monospace, monospace;
		padding: 3px 6px;
	}
	.text:focus-visible {
		outline: none;
		border-color: var(--app-accent);
	}
	select {
		flex: 1;
		min-width: 0;
		background: oklch(0.2 0.012 255);
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 5px;
		color: var(--app-ink);
		font-size: 11px;
		padding: 3px 4px;
	}
	.shadow-chip {
		flex: none;
		width: 22px;
		height: 22px;
		border-radius: 5px;
		background: oklch(0.25 0.012 255);
	}
	.revert {
		flex: none;
		border: none;
		background: transparent;
		color: var(--app-ink-soft);
		font-size: 13px;
		cursor: pointer;
		border-radius: 4px;
		padding: 2px 4px;
	}
	.revert:hover {
		color: var(--app-ink);
		background: oklch(0.26 0.012 255);
	}
</style>
