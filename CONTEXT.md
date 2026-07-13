# SpeedyTables

A headless, high-performance data grid for Svelte (with framework adapters as a goal), benchmarked against AG Grid at up to 1M rows. This glossary is the project's ubiquitous language.

## Language

### Data flow

**Grid**:
One table instance: source rows + columns + features, producing a windowed view.
_Avoid_: table (reserved for the component namespace `Table.*`)

**Row pipeline**:
The fixed, ordered sequence of transforms a Grid applies to source rows: source → filter → sort → window.
_Avoid_: data flow, processing chain

**Stage**:
One step of the row pipeline. Pure, memoized; reruns only when its inputs are invalidated, at most once per change.

**Window**:
The contiguous slice of pipeline output currently materialized for rendering.
_Avoid_: viewport rows, visible rows

**Full recompute**:
A pipeline pass from an invalidated stage onward (e.g. O(N log N) when the sort comparator changes).

**Incremental update**:
Patching a delta into the existing filtered+sorted output without a full pipeline recompute; one merge pass per coalesced frame batch.

### Extension & execution

**Feature**:
A pluggable unit of grid behavior (sorting, filtering, …) that supplies a stage implementation and/or column behavior. Wired explicitly at Grid construction; an absent Feature costs nothing.
_Avoid_: plugin, module, extension

**Executor**:
The injected strategy deciding where pipeline stages run: main-thread time-sliced, or web worker. The pipeline itself is thread-agnostic.

**Declarative operation**:
A sort/filter expressed as serializable data (column id + direction/operator + value) rather than a function. Only declarative operations can run on the worker executor.

**Columnar projection**:
Per-column typed arrays of sort/filter keys extracted from source rows, so stages never walk row objects.

### Adapters

**Adapter**:
A framework-specific package mapping the core's subscription surface onto that framework's reactivity (Svelte runes in v1). Adapters contain no grid logic.
_Avoid_: wrapper, binding

**Slice**:
One independently-subscribable unit of grid state (sort model, window, scroll metrics, …). Notifications are per-slice; payloads are window-sized, never dataset-sized.

### Mutation

**Client row model**:
All source rows in browser memory; the pipeline runs locally. v1's only row model.

**Delta**:
An explicit batch of row mutations (insert / update / remove, keyed by row id). The only input to the incremental update path.
_Avoid_: transaction (AG Grid's term; ours differs in shape)

**Row id**:
Stable, consumer-supplied identity for a row. Required. What deltas and incremental patches key on.

**Coalescing**:
Batching all deltas received within one animation frame into a single pipeline patch.

### Theming

**Theme**:
A shippable visual identity for the grid: a token file (plus the shared base stylesheet) or a part-class preset. Activated by `data-speedy-theme` on an ancestor.

**Token**:
One documented `--st-*` custom property in the public styling contract (surface, ink, border, accent, radius, density, motion). Additive-only after 1.0.
_Avoid_: variable, CSS var (in docs — "token" is the contract word)

**Part**:
A named, stylable element the components emit (headerCell, row, cell, filterInput, …), addressable by `data-speedy-*` attribute and by the `classes` map.

**Customization ladder**:
The supported escalation path: token override → attribute CSS → part classes → snippet overrides → headless core.

**Override**:
One token value changed from the base theme. The editor stores only overrides and layers them as inline custom properties over the base theme's stylesheet.

**Draft**:
The theme editor's serializable state: base theme + overrides + row height. What autosave, named saves, share links, and JSON export carry.

**Probe**:
Reading a theme's effective token values from the computed styles of a hidden element, so the editor never duplicates theme CSS.

**Picked theme**:
The theme last viewed in the gallery or saved in the editor, persisted locally. Demo scenario pages follow it; bench runs pin their theme explicitly and start with fresh storage.

### Benchmarking

**Scenario**:
A demo-app page that is simultaneously a working example and a benchmark: instrumented with performance marks, drivable by the harness against both SpeedyTables and AG Grid on identical data.
_Avoid_: example page, demo (alone)

**Baseline**:
Recorded AG Grid results for a scenario, captured before/independently of our implementation. Every feature ships with numbers against a baseline.
