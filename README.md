# SpeedyTables

A headless data grid for Svelte, built to stay fast at a million rows — and to prove it.

Every feature ships with recorded benchmark numbers against [AG Grid](https://github.com/ag-grid/ag-grid) on identical data, captured by an automated harness. The goals: interactions never block the frame budget (≤16ms), low CPU, smooth scrolling at 1,000,000 rows.

## Status

Pre-alpha. The benchmark infrastructure lands first so every feature that follows has honest before/after numbers.

## Features

_None shipped yet. Features appear here as they land — each with its benchmark results._

## Benchmarks

Scenario pages live in the demo app and run against both grids. Results history: `tools/bench/results/`.

```sh
pnpm install
pnpm bench          # all scenarios
pnpm bench sort-1m  # one scenario
```
