<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	/* App-wide dark scheme: form controls, scrollbars, and popovers render dark natively. */
	:global(:root) {
		color-scheme: dark;
		--app-ink: oklch(0.93 0.005 250);
		--app-ink-soft: oklch(0.72 0.015 250);
		--app-bg: oklch(0.16 0.01 255);
		--app-accent: oklch(0.72 0.1 220);
	}
	:global(body) {
		margin: 0;
		background: var(--app-bg);
		color: var(--app-ink);
		font-family: system-ui, sans-serif;
	}
	:global(a) {
		color: var(--app-accent);
	}
</style>
