# Benchmark report

Newest recorded run per scenario/grid/size. Regenerate with `pnpm bench:report --write`.
Metric definitions and caveats: [docs/benchmarking.md](../../docs/benchmarking.md). Full log: [HISTORY.md](HISTORY.md).

## enum-filter — aggrid, 1m rows (median of 3)

_2026-07-12T19:31:10.789Z · commit 43c4072 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-19-31-10-43c4072.json](2026-07-12-19-31-10-43c4072.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 296.3 |
| applyFiveOf11Ms | 647 |
| addValueMs | 534.3 |
| removeValueMs | 483.3 |
| stackSecondEnumMs | 534.1 |
| clearAllMs | 683.1 |
| longTaskCount | 6 |
| longTaskTotalMs | 3106 |
| longTaskMaxMs | 676 |
| cdpTaskDurationMs | 4000.89 |
| cdpJsHeapUsedMB | 543.72 |

## filter-1m — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-19-17-02-47804c9.json](2026-07-12-19-17-02-47804c9.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 250.9 |
| keystrokeMaxMs | 443.7 |
| clearFilterMs | 199.6 |
| longTaskCount | 8 |
| longTaskTotalMs | 2225 |
| longTaskMaxMs | 412 |
| keystroke1Ms | 443.7 |
| keystroke2Ms | 399.3 |
| keystroke3Ms | 266.6 |
| keystroke4Ms | 250.3 |
| keystroke5Ms | 249.7 |
| keystroke6Ms | 250.5 |
| keystroke7Ms | 249.6 |
| cdpTaskDurationMs | 3170.26 |
| cdpJsHeapUsedMB | 467.03 |

## initial-render — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T20:05:29.338Z · core v0.1.0 · commit a18e659 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-05-29-v0.1.0-a18e659.json](2026-07-12-20-05-29-v0.1.0-a18e659.json)_

| metric | value |
| --- | ---: |
| generateMs | 234.2 |
| mountMs | 764.8 |
| cdpTaskDurationMs | 994.39 |
| cdpJsHeapUsedMB | 468.51 |

## initial-render — speedy 0.1.0, 1m rows (median of 3)

_2026-07-12T20:05:29.338Z · core v0.1.0 · commit a18e659 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-05-29-v0.1.0-a18e659.json](2026-07-12-20-05-29-v0.1.0-a18e659.json)_

| metric | value |
| --- | ---: |
| generateMs | 235.9 |
| mountMs | 39.9 |
| cdpTaskDurationMs | 251.08 |
| cdpJsHeapUsedMB | 232.22 |

## live-updates — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-19-17-02-47804c9.json](2026-07-12-19-17-02-47804c9.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 3554 |
| frames | 16 |
| frameAvgMs | 331.71 |
| frameP95Ms | 1819.4 |
| frameMaxMs | 1819.4 |
| framesOver16Pct | 25 |
| framesOver33Pct | 18.75 |
| longTaskCount | 4 |
| longTaskTotalMs | 9151 |
| longTaskMaxMs | 3970 |
| cdpTaskDurationMs | 10077.19 |
| cdpJsHeapUsedMB | 669.45 |

## scroll-storm — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T20:05:29.338Z · core v0.1.0 · commit a18e659 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-05-29-v0.1.0-a18e659.json](2026-07-12-20-05-29-v0.1.0-a18e659.json)_

| metric | value |
| --- | ---: |
| frames | 116 |
| frameAvgMs | 34.41 |
| frameP95Ms | 45.2 |
| frameMaxMs | 193.7 |
| framesOver16Pct | 99.14 |
| framesOver33Pct | 39.34 |
| longTaskCount | 2 |
| longTaskTotalMs | 244 |
| longTaskMaxMs | 193 |
| cdpTaskDurationMs | 4932.48 |
| cdpJsHeapUsedMB | 536.42 |

## scroll-storm — speedy 0.1.0, 1m rows (median of 3)

_2026-07-12T20:05:29.338Z · core v0.1.0 · commit a18e659 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-20-05-29-v0.1.0-a18e659.json](2026-07-12-20-05-29-v0.1.0-a18e659.json)_

| metric | value |
| --- | ---: |
| frames | 240 |
| frameAvgMs | 16.67 |
| frameP95Ms | 17.8 |
| frameMaxMs | 19 |
| framesOver16Pct | 22.5 |
| framesOver33Pct | 0 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 681.46 |
| cdpJsHeapUsedMB | 239.94 |

## sort-1m — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-19-17-02-47804c9.json](2026-07-12-19-17-02-47804c9.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 2428.5 |
| sortNumberAscMs | 2634.3 |
| sortTextAscMs | 3015.6 |
| clearSortMs | 217 |
| longTaskCount | 4 |
| longTaskTotalMs | 8348 |
| longTaskMaxMs | 3004 |
| cdpTaskDurationMs | 9291.41 |
| cdpJsHeapUsedMB | 517.31 |

## wide-grid — aggrid 34.3.1, 10k rows (median of 3)

_2026-07-12T19:39:33.819Z · core v0.0.0 · commit 032ae3b · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-19-39-33-v0.0.0-032ae3b.json](2026-07-12-19-39-33-v0.0.0-032ae3b.json)_

| metric | value |
| --- | ---: |
| frames | 181 |
| frameAvgMs | 16.63 |
| frameP95Ms | 18 |
| frameMaxMs | 18.7 |
| framesOver16Pct | 29.28 |
| framesOver33Pct | 0 |
| sortMs | 49.5 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 595.72 |
| cdpJsHeapUsedMB | 82.98 |

