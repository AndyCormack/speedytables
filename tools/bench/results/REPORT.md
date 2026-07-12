# Benchmark report

Newest recorded run per scenario/grid/size. Regenerate with `pnpm bench:report --write`.
Metric definitions and caveats: [docs/benchmarking.md](../../docs/benchmarking.md).

## enum-filter — aggrid, 1m rows (median of 3)

_2026-07-12T19:31:10.789Z · commit 43c4072 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

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

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

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

## initial-render — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

| metric | value |
| --- | ---: |
| generateMs | 213 |
| mountMs | 756.4 |
| cdpTaskDurationMs | 993.12 |
| cdpJsHeapUsedMB | 468.12 |

## live-updates — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

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

## scroll-storm — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

| metric | value |
| --- | ---: |
| frames | 146 |
| frameAvgMs | 27.41 |
| frameP95Ms | 37.2 |
| frameMaxMs | 69.3 |
| framesOver16Pct | 99.32 |
| framesOver33Pct | 13.01 |
| longTaskCount | 2 |
| longTaskTotalMs | 126 |
| longTaskMaxMs | 68 |
| cdpTaskDurationMs | 4895.14 |
| cdpJsHeapUsedMB | 570.96 |

## sort-1m — aggrid, 1m rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

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

## wide-grid — aggrid, 10k rows (median of 3)

_2026-07-12T19:17:02.605Z · commit 47804c9 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55_

| metric | value |
| --- | ---: |
| frames | 181 |
| frameAvgMs | 16.61 |
| frameP95Ms | 18 |
| frameMaxMs | 18.6 |
| framesOver16Pct | 33.15 |
| framesOver33Pct | 0 |
| sortMs | 48.7 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 580.85 |
| cdpJsHeapUsedMB | 80.6 |

