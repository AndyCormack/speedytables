# Benchmark report

Newest recorded run per scenario/grid/size. Regenerate with `pnpm bench:report --write`.
Metric definitions and caveats: [docs/benchmarking.md](../../docs/benchmarking.md). Full log: [HISTORY.md](HISTORY.md).

## enum-filter — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 242.7 |
| applyFiveOf11Ms | 598.1 |
| addValueMs | 500.1 |
| removeValueMs | 450.6 |
| stackSecondEnumMs | 516.2 |
| clearAllMs | 617 |
| longTaskCount | 6 |
| longTaskTotalMs | 2895 |
| longTaskMaxMs | 614 |
| cdpTaskDurationMs | 3726.27 |
| cdpJsHeapUsedMB | 534.12 |

## enum-filter — speedy 0.3.2, 1m rows (median of 3)

_2026-07-12T22:24:58.375Z · core v0.3.2 · commit 1cc7d53 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-22-24-58-v0.3.2-1cc7d53.json](2026-07-12-22-24-58-v0.3.2-1cc7d53.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 28.2 |
| applyFiveOf11Ms | 33.5 |
| addValueMs | 32.9 |
| removeValueMs | 33.4 |
| stackSecondEnumMs | 35.2 |
| clearAllMs | 31.8 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 389.33 |
| cdpJsHeapUsedMB | 244.26 |

## filter-1m — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 232.9 |
| keystrokeMaxMs | 359.5 |
| clearFilterMs | 199.1 |
| longTaskCount | 8 |
| longTaskTotalMs | 1935 |
| longTaskMaxMs | 352 |
| keystroke1Ms | 356 |
| keystroke2Ms | 343.8 |
| keystroke3Ms | 232.9 |
| keystroke4Ms | 217.8 |
| keystroke5Ms | 216 |
| keystroke6Ms | 217.7 |
| keystroke7Ms | 217.6 |
| cdpTaskDurationMs | 2820.93 |
| cdpJsHeapUsedMB | 462.67 |

## filter-1m — speedy 0.3.2, 1m rows (median of 3)

_2026-07-12T22:24:58.375Z · core v0.3.2 · commit 1cc7d53 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-22-24-58-v0.3.2-1cc7d53.json](2026-07-12-22-24-58-v0.3.2-1cc7d53.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 33.3 |
| keystrokeMaxMs | 107.8 |
| clearFilterMs | 33.2 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| keystroke1Ms | 107.8 |
| keystroke2Ms | 20.2 |
| keystroke3Ms | 33.5 |
| keystroke4Ms | 33 |
| keystroke5Ms | 33.3 |
| keystroke6Ms | 32.9 |
| keystroke7Ms | 33.8 |
| cdpTaskDurationMs | 390.85 |
| cdpJsHeapUsedMB | 308.04 |

## initial-render — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| generateMs | 227.2 |
| mountMs | 671.3 |
| cdpTaskDurationMs | 896.45 |
| cdpJsHeapUsedMB | 475.85 |

## initial-render — speedy 0.3.2, 1m rows (median of 3)

_2026-07-12T22:24:58.375Z · core v0.3.2 · commit 1cc7d53 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-22-24-58-v0.3.2-1cc7d53.json](2026-07-12-22-24-58-v0.3.2-1cc7d53.json)_

| metric | value |
| --- | ---: |
| generateMs | 222.6 |
| mountMs | 47.6 |
| cdpTaskDurationMs | 240.48 |
| cdpJsHeapUsedMB | 231.86 |

## live-updates — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 3513 |
| frames | 16 |
| frameAvgMs | 328.71 |
| frameP95Ms | 1750.2 |
| frameMaxMs | 1750.2 |
| framesOver16Pct | 25 |
| framesOver33Pct | 18.75 |
| longTaskCount | 4 |
| longTaskTotalMs | 9131 |
| longTaskMaxMs | 4002 |
| cdpTaskDurationMs | 9993.38 |
| cdpJsHeapUsedMB | 657.35 |

## scroll-storm — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| frames | 241 |
| frameAvgMs | 16.65 |
| frameP95Ms | 18 |
| frameMaxMs | 39.9 |
| framesOver16Pct | 28.03 |
| framesOver33Pct | 0.41 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 2251.44 |
| cdpJsHeapUsedMB | 523.77 |

## scroll-storm — speedy 0.3.2, 1m rows (median of 3)

_2026-07-12T22:24:58.375Z · core v0.3.2 · commit 1cc7d53 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-22-24-58-v0.3.2-1cc7d53.json](2026-07-12-22-24-58-v0.3.2-1cc7d53.json)_

| metric | value |
| --- | ---: |
| frames | 240 |
| frameAvgMs | 16.67 |
| frameP95Ms | 18.1 |
| frameMaxMs | 21.2 |
| framesOver16Pct | 27 |
| framesOver33Pct | 0 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 832.47 |
| cdpJsHeapUsedMB | 239.87 |

## sort-1m — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 2298.3 |
| sortNumberAscMs | 2225.6 |
| sortTextAscMs | 2549.8 |
| clearSortMs | 150.9 |
| longTaskCount | 4 |
| longTaskTotalMs | 7273 |
| longTaskMaxMs | 2537 |
| cdpTaskDurationMs | 8113.35 |
| cdpJsHeapUsedMB | 511.34 |

## sort-1m — speedy 0.3.2, 1m rows (median of 3)

_2026-07-12T22:24:58.375Z · core v0.3.2 · commit 1cc7d53 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-22-24-58-v0.3.2-1cc7d53.json](2026-07-12-22-24-58-v0.3.2-1cc7d53.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 258 |
| sortNumberAscMs | 283.1 |
| sortTextAscMs | 500.3 |
| clearSortMs | 33.6 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 1269.46 |
| cdpJsHeapUsedMB | 251.15 |

## wide-grid — aggrid 34.3.1, 10k rows (median of 3)

_2026-07-12T21:23:13.835Z · core v0.3.1 · commit cbe9092 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-21-23-13-v0.3.1-cbe9092.json](2026-07-12-21-23-13-v0.3.1-cbe9092.json)_

| metric | value |
| --- | ---: |
| frames | 181 |
| frameAvgMs | 16.63 |
| frameP95Ms | 18.1 |
| frameMaxMs | 18.9 |
| framesOver16Pct | 31.49 |
| framesOver33Pct | 0 |
| sortMs | 33.1 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 539.7 |
| cdpJsHeapUsedMB | 73.98 |

## wide-grid — speedy 0.3.2, 10k rows (median of 3)

_2026-07-12T22:24:58.375Z · core v0.3.2 · commit 1cc7d53 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-22-24-58-v0.3.2-1cc7d53.json](2026-07-12-22-24-58-v0.3.2-1cc7d53.json)_

| metric | value |
| --- | ---: |
| frames | 180 |
| frameAvgMs | 16.67 |
| frameP95Ms | 18 |
| frameMaxMs | 18.3 |
| framesOver16Pct | 26.11 |
| framesOver33Pct | 0 |
| sortMs | 32.9 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 388.19 |
| cdpJsHeapUsedMB | 62.53 |

