# Thread-agnostic pipeline with an injected executor; declarative-first operations

Sorting 1M rows costs 100–500ms of compute — far beyond the ≤16ms frame budget — so it must run off the critical path. Rather than committing to worker-only or main-thread-only, the pipeline is pure functions over columnar projections with an injected **executor**: main-thread time-sliced first (milestone M2), web worker second (M5), benchmarked A/B so "workers are faster" is a measured claim per scenario, not a guess.

Because workers only receive serializable data, the public sort/filter API is **declarative-first** (column id + direction/operator + value); custom comparator/predicate functions are supported but documented as main-thread-only. The worker returns only a transferable `Uint32Array` of row indices (~4MB at 1M rows, zero-copy).

## Consequences

- Two executors is more code than one; the seam is the dependency-injection point the project explicitly wanted, and the A/B benchmark is itself a deliverable.
- Consumers using custom functions silently lose worker eligibility — must be documented loudly.

## Consequences (updated when the worker shipped, v0.5.0)

- The worker seam landed at the **operation level**, not the generator level: executor jobs are generators closing over main-thread state and cannot cross a worker boundary. Instead the worker holds a projection mirror (numbers as transferred buffer copies, text as chunked clones with yields between sends) and receives declarative filter/sort models — exactly what declarative-first made possible. The same pure stage generators run on both sides; the worker just drains them without slicing.
- Measured A/B at 1M rows: sorts do the same or better wall time with **4.4× less main-thread work** (300ms vs 1,325ms); filters comparable with a one-time ~0.2s text-projection handoff on first use; deltas are main-thread either way. Default remains `main-thread`; `compute: 'worker'` is the opt-in.
- Incremental deltas patch main-side state and bump a data version; the worker mirror re-syncs on its next rebuild. Patch predicate/sort-keys hydrate lazily after a worker rebuild.
