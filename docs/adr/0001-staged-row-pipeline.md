# Staged row pipeline instead of an event-bus module system

Features must be pluggable without adding per-feature passes over 1M rows. AG Grid solves extensibility with a bean/module registry where features subscribe to lifecycle events anywhere — flexible, but invalidation becomes emergent and accidental O(N) passes are easy. We instead fixed the core as a single ordered pipeline (source → filter → sort → window) of pure, memoized, dirty-flagged stages; a Feature *is* a stage implementation (plus optional column behavior), wired explicitly at grid construction with no runtime registry.

## Considered options

- **Event-bus modules (AG Grid style)** — rejected: invalidation order is emergent; contradicts the lowest-complexity goal.
- **State-reducer features (TanStack style)** — rejected: every feature touches the shared state shape, entangling features with core types.

## Consequences

- Per-change cost is bounded by design regardless of feature count: each stage runs at most once per invalidation.
- Features that don't fit a fixed stage order (e.g. grouping) require a deliberate pipeline change — that friction is intentional.

## Amendment (2026-07-13, v0.8.0): the construction-time wiring was never built

"Wired explicitly at grid construction" describes an API that never materialized. From M2 onward the stages are hard imports inside `RowPipeline` (`sortIndexJob`, `filterIndicesJob`); `GridConfig` never gained a features parameter. The drift was silent — no commit or record marked it — so this amendment records it after the fact.

It stuck for two reasons. The recorded one: an indirection seam for two stages with one implementation each is speculative generality (the lowest-complexity rule). The unrecorded, stronger one: from M5 the worker executor rebuilds stages from declarative messages and `pipeline.worker.ts` holds its own copy of the stage logic, so a consumer-supplied stage function cannot cross the thread boundary. A pluggable-stage API would have broken worker and hybrid modes — including the default — the moment M5 shipped.

What survives of the original intent: the fixed stage order is still the extension mechanism, "an absent Feature costs nothing" still holds (an empty sort or filter model short-circuits its stage), and features that don't fit the order still require a deliberate pipeline change. If a custom-stage API is ever added, it must be main-thread-only by construction.
