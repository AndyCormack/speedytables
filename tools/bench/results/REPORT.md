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

## filter-1m — speedy (worker) 0.5.1, 1m rows (median of 3)

_2026-07-13T09:27:33.773Z · core v0.5.1 · commit 456f688 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-09-27-33-v0.5.1-456f688.json](2026-07-13-09-27-33-v0.5.1-456f688.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 33.14 |
| keystrokeMaxMs | 210.63 |
| clearFilterMs | 33.03 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| keystroke1Ms | 210.63 |
| keystroke2Ms | 33.19 |
| keystroke3Ms | 32.81 |
| keystroke4Ms | 32.98 |
| keystroke5Ms | 34.44 |
| keystroke6Ms | 32.51 |
| keystroke7Ms | 33.18 |
| workerHeapMB | 98.82 |
| cdpTaskDurationMs | 344.65 |
| cdpJsHeapUsedMB | 283.75 |

## filter-1m — speedy (hybrid) 0.5.1, 1m rows (median of 3)

_2026-07-13T09:27:44.840Z · core v0.5.1 · commit 456f688 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-09-27-44-v0.5.1-456f688.json](2026-07-13-09-27-44-v0.5.1-456f688.json)_

| metric | value |
| --- | ---: |
| keystrokeMedianMs | 33.5 |
| keystrokeMaxMs | 116.01 |
| clearFilterMs | 34 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| keystroke1Ms | 116.01 |
| keystroke2Ms | 24.22 |
| keystroke3Ms | 32.51 |
| keystroke4Ms | 33.5 |
| keystroke5Ms | 32.97 |
| keystroke6Ms | 33.53 |
| keystroke7Ms | 33.75 |
| workerHeapMB | 0.33 |
| cdpTaskDurationMs | 400.48 |
| cdpJsHeapUsedMB | 314.31 |

## initial-render — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-13T10:17:32.885Z · core v0.6.0 · commit 9201ce4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-10-17-32-v0.6.0-9201ce4.json](2026-07-13-10-17-32-v0.6.0-9201ce4.json)_

| metric | value |
| --- | ---: |
| generateMs | 223.92 |
| mountMs | 684.24 |
| cdpTaskDurationMs | 898.83 |
| cdpJsHeapUsedMB | 475.82 |

## initial-render — speedy 0.7.0, 1m rows (median of 3)

_2026-07-13T11:30:48.093Z · core v0.7.0 · commit 587fe58 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-11-30-48-v0.7.0-587fe58.json](2026-07-13-11-30-48-v0.7.0-587fe58.json)_

| metric | value |
| --- | ---: |
| generateMs | 233.5 |
| mountMs | 46.68 |
| cdpTaskDurationMs | 259.05 |
| cdpJsHeapUsedMB | 236.2 |

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

## live-updates — speedy 0.7.0, 1m rows (median of 3)

_2026-07-13T11:30:48.093Z · core v0.7.0 · commit 587fe58 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-11-30-48-v0.7.0-587fe58.json](2026-07-13-11-30-48-v0.7.0-587fe58.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 4991 |
| frames | 298 |
| frameAvgMs | 16.76 |
| frameP95Ms | 20.16 |
| frameMaxMs | 50.17 |
| framesOver16Pct | 41.61 |
| framesOver33Pct | 0.34 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 4753.86 |
| cdpJsHeapUsedMB | 278.08 |

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

## live-updates — speedy [tailwind] 0.7.0, 1m rows (median of 3)

_2026-07-13T11:31:22.191Z · core v0.7.0 · commit 587fe58 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-11-31-22-v0.7.0-587fe58.json](2026-07-13-11-31-22-v0.7.0-587fe58.json)_

| metric | value |
| --- | ---: |
| ticksApplied | 4994 |
| frames | 297 |
| frameAvgMs | 16.86 |
| frameP95Ms | 20.66 |
| frameMaxMs | 61.6 |
| framesOver16Pct | 41.75 |
| framesOver33Pct | 0.34 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 4928.14 |
| cdpJsHeapUsedMB | 278.04 |

## scroll-storm — aggrid 34.3.1, 1m rows (median of 3)

_2026-07-13T10:17:32.885Z · core v0.6.0 · commit 9201ce4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-10-17-32-v0.6.0-9201ce4.json](2026-07-13-10-17-32-v0.6.0-9201ce4.json)_

| metric | value |
| --- | ---: |
| frames | 241 |
| frameAvgMs | 16.63 |
| frameP95Ms | 18 |
| frameMaxMs | 32.62 |
| framesOver16Pct | 33.61 |
| framesOver33Pct | 0 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 2424.32 |
| cdpJsHeapUsedMB | 517.45 |

## scroll-storm — speedy 0.7.0, 1m rows (median of 3)

_2026-07-13T11:30:48.093Z · core v0.7.0 · commit 587fe58 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-11-30-48-v0.7.0-587fe58.json](2026-07-13-11-30-48-v0.7.0-587fe58.json)_

| metric | value |
| --- | ---: |
| frames | 240 |
| frameAvgMs | 16.67 |
| frameP95Ms | 18.05 |
| frameMaxMs | 20.87 |
| framesOver16Pct | 35.42 |
| framesOver33Pct | 0 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 1023.09 |
| cdpJsHeapUsedMB | 246.31 |

## scroll-storm — speedy [tailwind] 0.7.0, 1m rows (median of 3)

_2026-07-13T11:31:22.191Z · core v0.7.0 · commit 587fe58 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-11-31-22-v0.7.0-587fe58.json](2026-07-13-11-31-22-v0.7.0-587fe58.json)_

| metric | value |
| --- | ---: |
| frames | 240 |
| frameAvgMs | 16.67 |
| frameP95Ms | 18.01 |
| frameMaxMs | 18.96 |
| framesOver16Pct | 39.17 |
| framesOver33Pct | 0 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 1371.36 |
| cdpJsHeapUsedMB | 244.11 |

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

## sort-1m — speedy (worker) 0.5.1, 1m rows (median of 3)

_2026-07-13T09:27:33.773Z · core v0.5.1 · commit 456f688 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-09-27-33-v0.5.1-456f688.json](2026-07-13-09-27-33-v0.5.1-456f688.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 249.87 |
| sortNumberAscMs | 266.24 |
| sortTextAscMs | 483.09 |
| clearSortMs | 33.55 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| workerHeapMB | 44.34 |
| cdpTaskDurationMs | 302.24 |
| cdpJsHeapUsedMB | 254.32 |

## sort-1m — speedy (hybrid) 0.5.1, 1m rows (median of 3)

_2026-07-13T09:27:44.840Z · core v0.5.1 · commit 456f688 (dirty) · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-09-27-44-v0.5.1-456f688.json](2026-07-13-09-27-44-v0.5.1-456f688.json)_

| metric | value |
| --- | ---: |
| sortNumberDescMs | 263.61 |
| sortNumberAscMs | 282.99 |
| sortTextAscMs | 533.66 |
| clearSortMs | 33.42 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| workerHeapMB | 36.32 |
| cdpTaskDurationMs | 322.47 |
| cdpJsHeapUsedMB | 252.84 |

## wide-grid — aggrid 34.3.1, 10k rows (median of 3)

_2026-07-13T10:17:32.885Z · core v0.6.0 · commit 9201ce4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-10-17-32-v0.6.0-9201ce4.json](2026-07-13-10-17-32-v0.6.0-9201ce4.json)_

| metric | value |
| --- | ---: |
| frames | 181 |
| frameAvgMs | 16.62 |
| frameP95Ms | 18.03 |
| frameMaxMs | 18.44 |
| framesOver16Pct | 35.91 |
| framesOver33Pct | 0 |
| sortMs | 49.36 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 555.12 |
| cdpJsHeapUsedMB | 73.81 |

## wide-grid — speedy 0.6.0, 10k rows (median of 3)

_2026-07-13T10:17:32.885Z · core v0.6.0 · commit 9201ce4 · AMD Ryzen 7 9800X3D 8-Core Processor (16 cores) · Chromium 149.0.7827.55 · [2026-07-13-10-17-32-v0.6.0-9201ce4.json](2026-07-13-10-17-32-v0.6.0-9201ce4.json)_

| metric | value |
| --- | ---: |
| frames | 180 |
| frameAvgMs | 16.66 |
| frameP95Ms | 17.94 |
| frameMaxMs | 18.38 |
| framesOver16Pct | 27.78 |
| framesOver33Pct | 0 |
| sortMs | 33.28 |
| longTaskCount | 0 |
| longTaskTotalMs | 0 |
| longTaskMaxMs | 0 |
| cdpTaskDurationMs | 506.34 |
| cdpJsHeapUsedMB | 70.5 |

