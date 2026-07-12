# Benchmarking — how to read the numbers

Scenario pages in `apps/demo` run against both grids on identical seeded data. The runner
(`tools/bench`) drives them in headless Chromium against the **production preview build**
(never the dev server), repeats each scenario (default 3, fresh browser context each time),
and records **medians** plus raw runs to `tools/bench/results/*.json`. The human-readable
summary is `tools/bench/results/REPORT.md` (`pnpm bench:report --write`).

## Metric conventions

| Metric | Meaning |
| --- | --- |
| `*Ms` (e.g. `mountMs`, `sortNumberDescMs`, `keystroke3Ms`) | Operation latency: API call → next painted frame (double `requestAnimationFrame`). Includes both compute and render. |
| `longTaskCount` / `longTaskTotalMs` / `longTaskMaxMs` | Main-thread tasks over 50ms (the platform `longtask` threshold) while the scenario ran. `longTaskMaxMs` is the single worst blocking stretch — the headline responsiveness number. |
| `frames`, `frameAvgMs`, `frameP95Ms`, `frameMaxMs` | Frame-to-frame durations during driven animations (scroll sweeps, live updates). |
| `framesOver16Pct` / `framesOver33Pct` | Share of frames that missed the 60fps (>17ms) / 30fps (>33ms) budgets. |
| `cdpTaskDurationMs` | Total main-thread task time over the whole scenario, from Chrome's Performance domain — the "how much CPU did this burn" number. |
| `cdpJsHeapUsedMB` | JS heap at scenario end. |

## Caveats

- **`ticksApplied` (live-updates) is achieved throughput under load, not a latency metric.**
  The feed loop is frame-driven: ticks are batched per animation frame against a 1k/sec
  target for 5s. When the grid can't hold frame rate, later batches never get fed before
  the window closes — so a low `ticksApplied` means "the grid fell behind," conflating
  grid slowness with feed-loop cutoff. Compare it together with the frame stats.
- **Enum filters on AG Grid use OR-of-equals text conditions**, not AG Grid's set filter —
  the set filter is Enterprise-only and we benchmark against Community. Same filter
  pipeline, but not the checkbox-UI code path Enterprise users get.
- **Headless Chromium** timings differ slightly from headed browsers; comparisons are
  within-harness, machine and browser are recorded in each results file.
- `generateMs` (initial-render) is dataset synthesis, not grid work — reported so it can
  be excluded from grid comparisons.
