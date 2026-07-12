# SpeedyTables

A headless data grid for Svelte, built to stay fast at a million rows — and to prove it.

Every feature ships with recorded benchmark numbers against [AG Grid](https://github.com/ag-grid/ag-grid) on identical data, captured by an automated harness. The goals: interactions never block the frame budget (≤16ms), low CPU, smooth scrolling at 1,000,000 rows.

## Status

Pre-alpha. Rendering shipped (v0.1.0); sorting, filtering, and live updates are next — each lands here only once it has benchmark numbers.

## Features

Numbers are medians at 1,000,000 rows vs AG Grid Community on identical data ([full report](tools/bench/results/REPORT.md)).

- **Virtualized rendering** (v0.1.0) — a million rows mount in ~40ms (AG Grid: ~765ms) using ~half the memory. Works in any browser regardless of scroll-height limits.
- **Smooth scrolling at 1M rows** (v0.1.0) — a sustained full-height scroll sweep holds a locked 60fps with zero main-thread stalls (worst frame: 19ms). AG Grid averages 34ms per frame with stalls up to 194ms.

## Benchmarks

Scenario pages live in the demo app and run against both grids. Latest results: [`tools/bench/results/REPORT.md`](tools/bench/results/REPORT.md); raw history in the same directory, metric definitions in [`docs/benchmarking.md`](docs/benchmarking.md).

```sh
pnpm install
pnpm bench          # all scenarios
pnpm bench sort-1m  # one scenario
```
