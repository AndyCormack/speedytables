# Thread-agnostic pipeline with an injected executor; declarative-first operations

Sorting 1M rows costs 100–500ms of compute — far beyond the ≤16ms frame budget — so it must run off the critical path. Rather than committing to worker-only or main-thread-only, the pipeline is pure functions over columnar projections with an injected **executor**: main-thread time-sliced first (milestone M2), web worker second (M5), benchmarked A/B so "workers are faster" is a measured claim per scenario, not a guess.

Because workers only receive serializable data, the public sort/filter API is **declarative-first** (column id + direction/operator + value); custom comparator/predicate functions are supported but documented as main-thread-only. The worker returns only a transferable `Uint32Array` of row indices (~4MB at 1M rows, zero-copy).

## Consequences

- Two executors is more code than one; the seam is the dependency-injection point the project explicitly wanted, and the A/B benchmark is itself a deliverable.
- Consumers using custom functions silently lose worker eligibility — must be documented loudly.
