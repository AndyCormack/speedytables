<script lang="ts">
	import { scenarios } from '$lib/scenarios';
</script>

<svelte:head>
	<title>SpeedyTables demo & benchmarks</title>
</svelte:head>

<main>
	<h1>SpeedyTables</h1>
	<p>Benchmark scenario pages. Each runs against AG Grid or SpeedyTables on identical seeded data.</p>
	<ul>
		{#each Object.values(scenarios) as scenario (scenario.name)}
			<li>
				<a href="/scenarios/{scenario.name}?grid=aggrid&size={scenario.defaultSize}">
					{scenario.name}
				</a>
				— {scenario.description}
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 48rem;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
	}
	li {
		margin: 0.5rem 0;
	}
</style>
