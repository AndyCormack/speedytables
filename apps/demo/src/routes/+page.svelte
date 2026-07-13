<script lang="ts">
	import { scenarios } from '$lib/scenarios';

	const list = Object.values(scenarios);
</script>

<svelte:head>
	<title>SpeedyTables — demo & benchmarks</title>
</svelte:head>

<main>
	<header>
		<h1>SpeedyTables</h1>
		<p class="tagline">
			A headless Svelte data grid built to stay fast at a million rows — and to prove it.
		</p>
		<p class="sub">
			Every page below is both a working demo and a recorded benchmark. Run it against
			SpeedyTables and AG Grid on identical seeded data; results persist so the comparison
			table fills in as you go.
		</p>
	</header>

	<ul class="scenarios">
		{#each list as scenario (scenario.name)}
			<li>
				<a href="/scenarios/{scenario.name}?grid=aggrid&size={scenario.defaultSize}">
					<span class="name">{scenario.name}</span>
					<span class="desc">{scenario.description}</span>
					<span class="size">{scenario.defaultSize} rows</span>
					<span class="arrow" aria-hidden="true">→</span>
				</a>
			</li>
		{/each}
	</ul>

	<p class="foot">
		Recorded results live in <code>tools/bench/results/</code> — regenerate with
		<code>pnpm bench</code>.
	</p>
</main>

<style>
	main {
		max-width: 44rem;
		margin: 3.5rem auto 4rem;
		padding: 0 1.25rem;
	}
	header {
		margin-bottom: 2rem;
	}
	h1 {
		margin: 0;
		font-size: 1.6rem;
		letter-spacing: -0.01em;
	}
	.tagline {
		margin: 0.35rem 0 0;
		font-size: 1rem;
		color: var(--app-ink);
	}
	.sub {
		margin: 0.6rem 0 0;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--app-ink-soft);
		max-width: 60ch;
		text-wrap: pretty;
	}

	.scenarios {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid oklch(0.28 0.012 255);
		border-radius: 8px;
		overflow: hidden;
		background: oklch(0.185 0.012 255);
	}
	.scenarios li + li {
		border-top: 1px solid oklch(0.24 0.01 255);
	}
	.scenarios a {
		display: grid;
		grid-template-columns: 11rem 1fr auto auto;
		align-items: baseline;
		gap: 1rem;
		padding: 0.7rem 1rem;
		text-decoration: none;
		color: inherit;
		transition: background-color 150ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.scenarios a:hover,
	.scenarios a:focus-visible {
		background: oklch(0.225 0.014 255);
		outline: none;
	}
	.scenarios a:focus-visible {
		box-shadow: inset 0 0 0 2px oklch(0.72 0.1 220 / 0.45);
	}
	.name {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--app-ink);
	}
	.scenarios a:hover .name {
		color: var(--app-accent);
	}
	.desc {
		font-size: 0.8rem;
		line-height: 1.45;
		color: var(--app-ink-soft);
	}
	.size {
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		color: oklch(0.58 0.02 250);
		white-space: nowrap;
	}
	.arrow {
		color: oklch(0.45 0.02 250);
		transition: transform 150ms cubic-bezier(0.165, 0.84, 0.44, 1), color 150ms;
	}
	.scenarios a:hover .arrow {
		color: var(--app-accent);
		transform: translateX(2px);
	}

	.foot {
		margin-top: 1.25rem;
		font-size: 0.75rem;
		color: oklch(0.55 0.015 250);
	}
	.foot code {
		font-size: 0.72rem;
		background: oklch(0.22 0.012 255);
		padding: 1px 5px;
		border-radius: 4px;
	}

	@media (max-width: 640px) {
		.scenarios a {
			grid-template-columns: 1fr auto;
		}
		.desc {
			grid-column: 1 / -1;
		}
		.size {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scenarios a,
		.arrow {
			transition: none;
		}
	}
</style>
