# SpeedyTables

A headless data grid for Svelte, built to stay fast at a million rows — and to prove it.

Every feature ships with recorded benchmark numbers against [AG Grid](https://github.com/ag-grid/ag-grid) on identical data, captured by an automated harness. The goals: interactions never block the frame budget (≤16ms), low CPU, smooth scrolling at 1,000,000 rows.

## Status

Pre-alpha. Rendering shipped (v0.1.0); sorting, filtering, and live updates are next — each lands here only once it has benchmark numbers.

## Features

Numbers are medians at 1,000,000 rows vs AG Grid Community on identical data ([full report](tools/bench/results/REPORT.md)).

- **Virtualized rendering** (v0.1.0) — a million rows mount in ~41ms (AG Grid: ~685ms) using half the memory and a quarter of the CPU. Works in any browser regardless of scroll-height limits.
- **Smooth scrolling at 1M rows** (v0.2.1) — a sustained full-height scroll sweep holds 60fps with zero main-thread stalls and a worst frame of 18.8ms, on 3.1× less CPU than AG Grid (whose worst frame is 41.2ms at the same frame rate).

- **Sorting** (v0.2.0) — sorting a million rows takes ~250ms on numbers and ~450ms on text, 6–9× faster than AG Grid (2.2–2.6s) — and the UI never freezes: work runs in ~12ms slices, so the grid stays scrollable mid-sort with zero main-thread stalls. AG Grid blocks the page for up to 2.6s per sort.

- **Filtering** (v0.3.0) — typing into a text filter over a million rows: the first keystroke scans everything in ~114ms, and every following keystroke refines only the previous matches — under two frames (~33ms), vs 232–376ms per keystroke for AG Grid. Enum/set filters apply in 30–66ms vs 259–667ms. All of it without ever freezing the page (AG Grid blocks up to 656ms per filter).

Comparisons use a deliberately minimal, production-configured AG Grid (see [fairness notes](docs/benchmarking.md)).

## Benchmarks

Scenario pages live in the demo app and run against both grids. Latest results: [`tools/bench/results/REPORT.md`](tools/bench/results/REPORT.md); raw history in the same directory, metric definitions in [`docs/benchmarking.md`](docs/benchmarking.md).

```sh
pnpm install
pnpm bench          # all scenarios
pnpm bench sort-1m  # one scenario
```
