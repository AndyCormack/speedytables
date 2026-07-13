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

## enum-filter — speedy 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:19.440Z · core v0.5.0 · commit 1c88195 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-19-v0.5.0-1c88195.json](2026-07-13-08-46-19-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 24.2 |
| applyFiveOf11Ms | 33.7 |
| addValueMs | 33.1 |
| removeValueMs | 32.7 |
| stackSecondEnumMs | 35.2 |
| clearAllMs | 31.7 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 397.2 |
| cdpJsHeapUsedMB | 249.03 |

## enum-filter — speedy (worker) 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:47.720Z · core v0.5.0 · commit 1c88195 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-47-v0.5.0-1c88195.json](2026-07-13-08-46-47-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| applyOneOf11Ms | 159.4 |
| applyFiveOf11Ms | 32.5 |
| addValueMs | 33.4 |
| removeValueMs | 33.4 |
| stackSecondEnumMs | 84.6 |
| clearAllMs | 33.5 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 335.21 |
| cdpJsHeapUsedMB | 260.65 |

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

## filter-1m — speedy 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:19.440Z · core v0.5.0 · commit 1c88195 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-19-v0.5.0-1c88195.json](2026-07-13-08-46-19-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 33.7 |
| keystrokeMaxMs | 122.8 |
| clearFilterMs | 32.5 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| keystroke1Ms | 122.8 |
| keystroke2Ms | 21.1 |
| keystroke3Ms | 33.5 |
| keystroke4Ms | 33.1 |
| keystroke5Ms | 33.6 |
| keystroke6Ms | 33.7 |
| keystroke7Ms | 33.7 |
| cdpTaskDurationMs | 446.93 |
| cdpJsHeapUsedMB | 312.18 |

## filter-1m — speedy (worker) 0.5.0, 1m rows (median of 3)

_2026-07-13T08:49:11.579Z · core v0.5.0 · commit 7b4727a · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-49-11-v0.5.0-7b4727a.json](2026-07-13-08-49-11-v0.5.0-7b4727a.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 33.2 |
| keystrokeMaxMs | 228.3 |
| clearFilterMs | 33.4 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| keystroke1Ms | 228.3 |
| keystroke2Ms | 33.1 |
| keystroke3Ms | 33 |
| keystroke4Ms | 33.1 |
| keystroke5Ms | 33.2 |
| keystroke6Ms | 33.4 |
| keystroke7Ms | 33.6 |
| cdpTaskDurationMs | 347.96 |
| cdpJsHeapUsedMB | 281.72 |

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

_2026-07-12T23:31:10.279Z · core v0.4.0 · commit d63ee72 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-12-23-31-10-v0.4.0-d63ee72.json](2026-07-12-23-31-10-v0.4.0-d63ee72.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 3380 |
| frames | 15 |
| frameAvgMs | 344.09 |
| frameP95Ms | 1773.8 |
| frameMaxMs | 1773.8 |
| framesOver16Pct | 31.58 |
| framesOver33Pct | 20 |
| longTaskCount | 4 |
| longTaskTotalMs | 9317 |
| longTaskMaxMs | 4166 |
| cdpTaskDurationMs | 10298.97 |
| cdpJsHeapUsedMB | 677.51 |

## live-updates — speedy 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:19.440Z · core v0.5.0 · commit 1c88195 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-19-v0.5.0-1c88195.json](2026-07-13-08-46-19-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 4992 |
| frames | 299 |
| frameAvgMs | 16.76 |
| frameP95Ms | 20 |
| frameMaxMs | 51.2 |
| framesOver16Pct | 40.6 |
| framesOver33Pct | 0.33 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 4875.48 |
| cdpJsHeapUsedMB | 277.86 |

## live-updates — speedy (worker) 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:47.720Z · core v0.5.0 · commit 1c88195 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-47-v0.5.0-1c88195.json](2026-07-13-08-46-47-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 4991 |
| frames | 296 |
| frameAvgMs | 16.9 |
| frameP95Ms | 19.9 |
| frameMaxMs | 92.7 |
| framesOver16Pct | 42.23 |
| framesOver33Pct | 0.34 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 4663.94 |
| cdpJsHeapUsedMB | 277.45 |

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

## sort-1m — speedy 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:19.440Z · core v0.5.0 · commit 1c88195 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-19-v0.5.0-1c88195.json](2026-07-13-08-46-19-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 259.5 |
| sortNumberAscMs | 282.1 |
| sortTextAscMs | 550.2 |
| clearSortMs | 33.2 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 1325.01 |
| cdpJsHeapUsedMB | 260.69 |

## sort-1m — speedy (worker) 0.5.0, 1m rows (median of 3)

_2026-07-13T08:46:47.720Z · core v0.5.0 · commit 1c88195 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-08-46-47-v0.5.0-1c88195.json](2026-07-13-08-46-47-v0.5.0-1c88195.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 250.8 |
| sortNumberAscMs | 265.1 |
| sortTextAscMs | 450.1 |
| clearSortMs | 33 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 299.55 |
| cdpJsHeapUsedMB | 250.1 |

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

