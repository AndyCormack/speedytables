# Staged row pipeline instead of an event-bus module system

Features must be pluggable without adding per-feature passes over 1M rows. AG Grid solves extensibility with a bean/module registry where features subscribe to lifecycle events anywhere — flexible, but invalidation becomes emergent and accidental O(N) passes are easy. We instead fixed the core as a single ordered pipeline (source → filter → sort → window) of pure, memoized, dirty-flagged stages; a Feature *is* a stage implementation (plus optional column behavior), wired explicitly at grid construction with no runtime registry.

## Considered options

- **Event-bus modules (AG Grid style)** — rejected: invalidation order is emergent; contradicts the lowest-complexity goal.
- **State-reducer features (TanStack style)** — rejected: every feature touches the shared state shape, entangling features with core types.

## Consequences

- Per-change cost is bounded by design regardless of feature count: each stage runs at most once per invalidation.
- Features that don't fit a fixed stage order (e.g. grouping) require a deliberate pipeline change — that friction is intentional.
