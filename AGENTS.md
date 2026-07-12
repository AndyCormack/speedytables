# AGENTS.md

Headless data grid for Svelte, benchmarked against AG Grid at 1M rows. Benchmarking **is** the product. Vocabulary: `CONTEXT.md` (use its terms exactly). Decisions: `docs/adr/`. Working plan/tasks: `.wip/` (git-ignored). Roadmap M0–M6: `.wip/plan.md`.

## Layout

- `packages/core` — `@speedytables/core`. Plain TS only: pipeline, columnar projections, executors, worker, per-slice subscriptions. **No Svelte imports, no DOM, no reactivity** — the worker must be able to run all of it.
- `packages/svelte` — `@speedytables/svelte`. Runes adapter + unstyled `Table.*` components. Thin: no grid logic here, ever.
- `apps/demo` — SvelteKit. Demo pages + benchmark scenario pages (each page serves both roles).
- `tools/bench` — Playwright + CDP runner; results JSON committed in `tools/bench/results/`.

## Non-negotiables

1. **Pipeline shape is fixed**: source → filter → sort → window. Features implement stages; stages are pure, memoized, dirty-flagged, and run at most once per change. No event bus, no runtime registry (ADR-0001).
2. **Hot path is never reactive.** No `$state` over row data. Reactivity lives only in the svelte adapter, over window-sized payloads (ADR-0003).
3. **Declarative-first APIs**: sort/filter as serializable descriptors so the worker executor can run them. Custom functions allowed but main-thread-only — document it wherever they appear (ADR-0002).
4. **Mutations only via `applyDelta`** keyed by required row id; frame-coalesced. Never diff arrays to find changes (ADR-0004).
5. **Complexity budget**: full recompute O(N log N), incremental update O(k log N), scroll→window O(1) (fixed row height in v1). Any new O(N)-per-change path is a design bug.
6. **No feature without a benchmark.** Every perf-relevant change runs `pnpm bench` before/after; results JSON is committed. Scenario pages must work identically for `?grid=speedy` and `?grid=aggrid`.
7. **README lists a feature only after it ships with recorded numbers.** Keep it user-centric and short; technical depth belongs in docs/adr and .wip.

## Conventions

- Svelte 5 runes mode only; no Svelte 4 patterns (`export let`, `$:`, `on:click`, stores for component state).
- TS strict everywhere. Vitest for core (pipeline is pure functions — test them directly, no DOM). Playwright for bench + smoke.
- Benchmark hygiene: seeded deterministic datasets only, medians over multiple runs, record machine + commit in results.
- Update `CONTEXT.md` when vocabulary changes; add an ADR only for hard-to-reverse, surprising, real-trade-off decisions.
