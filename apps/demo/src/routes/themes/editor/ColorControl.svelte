<script lang="ts">
	import type { TokenSpec } from '@speedytables/svelte';
	import { CHANNEL_MAX, CHANNEL_STEP, channelRamp, formatOklch, parseOklch } from '$lib/editor/color';
	import type { EditorState } from '$lib/editor/state.svelte';

	let {
		token,
		editor,
		quickPicks
	}: { token: TokenSpec; editor: EditorState; quickPicks: string[] } = $props();

	const uid = $props.id();
	const panelId = `${uid}-picker`;

	let trigger = $state<HTMLElement>();
	let panel = $state<HTMLElement>();

	const value = $derived(editor.value(token.name));
	const parsed = $derived(parseOklch(value));

	const CHANNELS = [
		{ id: 'l', label: 'L' },
		{ id: 'c', label: 'C' },
		{ id: 'h', label: 'H' },
		{ id: 'a', label: 'A' }
	] as const;

	function setChannel(channel: 'l' | 'c' | 'h' | 'a', raw: string) {
		if (!parsed) return;
		editor.setToken(token.name, formatOklch({ ...parsed, [channel]: parseFloat(raw) }));
	}

	function position(e: ToggleEvent) {
		if (!panel || !trigger || e.newState !== 'open') return;
		// toggle fires a task after the popover paints, so hide at beforetoggle and reveal once placed
		if (e.type === 'beforetoggle') {
			panel.style.visibility = 'hidden';
			return;
		}
		const rect = trigger.getBoundingClientRect();
		panel.style.position = 'fixed';
		panel.style.margin = '0';
		panel.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 8))}px`;
		panel.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 320)}px`;
		panel.style.visibility = 'visible';
	}
</script>

<div class="control" class:overridden={editor.isOverridden(token.name)}>
	<button
		type="button"
		class="swatch"
		style="background:{value};"
		aria-label="Pick {token.name}"
		popovertarget={panelId}
		bind:this={trigger}
	></button>
	<div class="meta">
		<label for="{uid}-text">{token.name.replace('--st-', '')}</label>
		<input
			id="{uid}-text"
			type="text"
			spellcheck="false"
			{value}
			onchange={(e) => editor.setToken(token.name, e.currentTarget.value)}
		/>
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

<div
	id={panelId}
	popover="auto"
	class="picker"
	bind:this={panel}
	onbeforetoggle={position}
	ontoggle={position}
>
	{#if parsed}
		{#each CHANNELS as ch (ch.id)}
			<div class="channel">
				<span class="ch-label">{ch.label}</span>
				<input
					type="range"
					min="0"
					max={CHANNEL_MAX[ch.id]}
					step={CHANNEL_STEP[ch.id]}
					value={parsed[ch.id]}
					style="--ramp:{channelRamp(parsed, ch.id)};"
					oninput={(e) => setChannel(ch.id, e.currentTarget.value)}
					aria-label="{token.name} {ch.label}"
				/>
				<span class="ch-value">{ch.id === 'h' ? Math.round(parsed[ch.id]) : parsed[ch.id].toFixed(ch.id === 'c' ? 3 : 2)}</span>
			</div>
		{/each}
	{:else}
		<p class="unparsed">Not an oklch() value; edit as text. Swatch shows the resolved color.</p>
	{/if}
	{#if quickPicks.length}
		<div class="picks" role="listbox" aria-label="Quick picks from shipped themes">
			{#each quickPicks as pick (pick)}
				<button
					type="button"
					class="pick"
					style="background:{pick};"
					title={pick}
					aria-label="Use {pick}"
					onclick={() => editor.setToken(token.name, pick)}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.control {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 0;
	}
	.swatch {
		width: 26px;
		height: 26px;
		flex: none;
		border: 1px solid oklch(0.35 0.012 255);
		border-radius: 6px;
		cursor: pointer;
	}
	.swatch:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.72 0.1 220 / 0.45);
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
	input[type='text'] {
		width: 100%;
		box-sizing: border-box;
		background: oklch(0.2 0.012 255);
		border: 1px solid oklch(0.32 0.012 255);
		border-radius: 5px;
		color: var(--app-ink);
		font: 11px ui-monospace, monospace;
		padding: 3px 6px;
	}
	input[type='text']:focus-visible {
		outline: none;
		border-color: var(--app-accent);
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

	.picker {
		width: 260px;
		border: 1px solid oklch(0.35 0.012 255);
		border-radius: 8px;
		background: oklch(0.21 0.012 255);
		color: var(--app-ink);
		padding: 10px;
		box-shadow: 0 8px 28px oklch(0 0 0 / 0.5);
	}
	.channel {
		display: grid;
		grid-template-columns: 14px 1fr 44px;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}
	.ch-label {
		font-size: 11px;
		color: var(--app-ink-soft);
	}
	.ch-value {
		font: 10.5px ui-monospace, monospace;
		text-align: right;
		color: var(--app-ink-soft);
	}
	input[type='range'] {
		appearance: none;
		height: 14px;
		border-radius: 7px;
		background: var(--ramp);
		border: 1px solid oklch(0.35 0.012 255 / 0.6);
		cursor: pointer;
	}
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: white;
		border: 2px solid oklch(0.2 0.01 255);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.4);
	}
	input[type='range']:focus-visible {
		outline: 2px solid oklch(0.72 0.1 220 / 0.6);
		outline-offset: 1px;
	}
	.unparsed {
		margin: 0 0 8px;
		font-size: 11px;
		color: var(--app-ink-soft);
	}
	.picks {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 4px;
		border-top: 1px solid oklch(0.3 0.012 255);
		padding-top: 8px;
	}
	.pick {
		aspect-ratio: 1;
		border-radius: 4px;
		border: 1px solid oklch(0.35 0.012 255);
		cursor: pointer;
	}
	.pick:hover {
		transform: scale(1.15);
	}
	@media (prefers-reduced-motion: reduce) {
		.pick:hover {
			transform: none;
		}
	}
</style>
