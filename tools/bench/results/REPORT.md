# Benchmark report

Newest recorded run per scenario/grid/size. Regenerate with `pnpm bench:report --write`.
Metric definitions and caveats: [docs/benchmarking.md](../../docs/benchmarking.md). Full log: [HISTORY.md](HISTORY.md).

## enum-filter — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:06:30.843Z · core v0.3.0 · commit 574cc7f · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-06-30-v0.3.0-574cc7f.json](2026-07-12-21-06-30-v0.3.0-574cc7f.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 259.1 |
| applyFiveOf11Ms | 619.2 |
| addValueMs | 517.1 |
| removeValueMs | 467.4 |
| stackSecondEnumMs | 549.5 |
| clearAllMs | 667.2 |
| longTaskCount | 6 |
| longTaskTotalMs | 3022 |
| longTaskMaxMs | 656 |
| cdpTaskDurationMs | 3948.94 |
| cdpJsHeapUsedMB | 531.12 |

## enum-filter — speedy 0.3.0, 1m rows (median of 3)

_2026-07-12T21:06:30.843Z · core v0.3.0 · commit 574cc7f · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-06-30-v0.3.0-574cc7f.json](2026-07-12-21-06-30-v0.3.0-574cc7f.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 29.6 |
| applyFiveOf11Ms | 34.5 |
| addValueMs | 32.4 |
| removeValueMs | 33.9 |
| stackSecondEnumMs | 65.9 |
| clearAllMs | 32.9 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 390.4 |
| cdpJsHeapUsedMB | 244.89 |

## filter-1m — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:06:30.843Z · core v0.3.0 · commit 574cc7f · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-06-30-v0.3.0-574cc7f.json](2026-07-12-21-06-30-v0.3.0-574cc7f.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 249 |
| keystrokeMaxMs | 376.2 |
| clearFilterMs | 217.2 |
| longTaskCount | 8 |
| longTaskTotalMs | 2084 |
| longTaskMaxMs | 372 |
| keystroke1Ms | 376.2 |
| keystroke2Ms | 369 |
| keystroke3Ms | 251.2 |
| keystroke4Ms | 232 |
| keystroke5Ms | 234.3 |
| keystroke6Ms | 232.6 |
| keystroke7Ms | 234.6 |
| cdpTaskDurationMs | 2939.41 |
| cdpJsHeapUsedMB | 457.73 |

## filter-1m — speedy 0.3.0, 1m rows (median of 3)

_2026-07-12T21:06:30.843Z · core v0.3.0 · commit 574cc7f · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-06-30-v0.3.0-574cc7f.json](2026-07-12-21-06-30-v0.3.0-574cc7f.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 33.3 |
| keystrokeMaxMs | 113.7 |
| clearFilterMs | 33.5 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| keystroke1Ms | 113.7 |
| keystroke2Ms | 32.9 |
| keystroke3Ms | 34 |
| keystroke4Ms | 33.3 |
| keystroke5Ms | 32.9 |
| keystroke6Ms | 33.5 |
| keystroke7Ms | 33.5 |
| cdpTaskDurationMs | 413 |
| cdpJsHeapUsedMB | 308.02 |

## initial-render — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T20:16:35.711Z · core v0.1.0 · commit ef490c4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-16-35-v0.1.0-ef490c4.json](2026-07-12-20-16-35-v0.1.0-ef490c4.json)_

| metric | value |
| --- | ---: |
| generateMs | 219.5 |
| mountMs | 685.3 |
| cdpTaskDurationMs | 897.05 |
| cdpJsHeapUsedMB | 475.75 |

## initial-render — speedy 0.1.0, 1m rows (median of 3)

_2026-07-12T20:17:04.627Z · core v0.1.0 · commit ef490c4 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-17-04-v0.1.0-ef490c4.json](2026-07-12-20-17-04-v0.1.0-ef490c4.json)_

| metric | value |
| --- | ---: |
| generateMs | 232.1 |
| mountMs | 40.7 |
| cdpTaskDurationMs | 248.82 |
| cdpJsHeapUsedMB | 231.79 |

## live-updates — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T20:16:35.711Z · core v0.1.0 · commit ef490c4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-16-35-v0.1.0-ef490c4.json](2026-07-12-20-16-35-v0.1.0-ef490c4.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 3580 |
| frames | 17 |
| frameAvgMs | 334.41 |
| frameP95Ms | 1878.2 |
| frameMaxMs | 1878.2 |
| framesOver16Pct | 35.29 |
| framesOver33Pct | 17.65 |
| longTaskCount | 4 |
| longTaskTotalMs | 9547 |
| longTaskMaxMs | 4275 |
| cdpTaskDurationMs | 10420.24 |
| cdpJsHeapUsedMB | 620 |

## scroll-storm — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T20:52:42.258Z · core v0.2.1 · commit 137db79 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-52-42-v0.2.1-137db79.json](2026-07-12-20-52-42-v0.2.1-137db79.json)_

| metric | value |
| --- | ---: |
| frames | 241 |
| frameAvgMs | 16.63 |
| frameP95Ms | 18.1 |
| frameMaxMs | 41.2 |
| framesOver16Pct | 31.12 |
| framesOver33Pct | 0.41 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 2436.91 |
| cdpJsHeapUsedMB | 522.95 |

## scroll-storm — speedy 0.2.1, 1m rows (median of 3)

_2026-07-12T20:52:42.258Z · core v0.2.1 · commit 137db79 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-52-42-v0.2.1-137db79.json](2026-07-12-20-52-42-v0.2.1-137db79.json)_

| metric | value |
| --- | ---: |
| frames | 240 |
| frameAvgMs | 16.67 |
| frameP95Ms | 18.1 |
| frameMaxMs | 18.8 |
| framesOver16Pct | 30 |
| framesOver33Pct | 0 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 788.8 |
| cdpJsHeapUsedMB | 240.39 |

## sort-1m — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T20:31:42.974Z · core v0.2.0 · commit 42faa4c (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-31-42-v0.2.0-42faa4c.json](2026-07-12-20-31-42-v0.2.0-42faa4c.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 2187.2 |
| sortNumberAscMs | 2277.8 |
| sortTextAscMs | 2600.1 |
| clearSortMs | 166.5 |
| longTaskCount | 4 |
| longTaskTotalMs | 7240 |
| longTaskMaxMs | 2590 |
| cdpTaskDurationMs | 8090.23 |
| cdpJsHeapUsedMB | 521.35 |

## sort-1m — speedy 0.2.0, 1m rows (median of 3)

_2026-07-12T20:31:42.974Z · core v0.2.0 · commit 42faa4c (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-31-42-v0.2.0-42faa4c.json](2026-07-12-20-31-42-v0.2.0-42faa4c.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 250.2 |
| sortNumberAscMs | 266 |
| sortTextAscMs | 450 |
| clearSortMs | 32.8 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 1161.31 |
| cdpJsHeapUsedMB | 256.49 |

## wide-grid — aggrid 34.3.1, 10k rows (median of 3)

_2026-07-12T20:16:35.711Z · core v0.1.0 · commit ef490c4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-16-35-v0.1.0-ef490c4.json](2026-07-12-20-16-35-v0.1.0-ef490c4.json)_

| metric | value |
| --- | ---: |
| frames | 181 |
| frameAvgMs | 16.61 |
| frameP95Ms | 18.1 |
| frameMaxMs | 18.8 |
| framesOver16Pct | 31.49 |
| framesOver33Pct | 0 |
| sortMs | 34.4 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 517.79 |
| cdpJsHeapUsedMB | 71.38 |

