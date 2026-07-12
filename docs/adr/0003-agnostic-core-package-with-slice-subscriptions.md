# Framework-agnostic core package with per-slice, window-sized subscriptions

Framework adapters (React/Vue later) are a stated goal, not a hedge, so the split is enforced by the package graph now: `@speedytables/core` (plain TS — pipeline, executors, worker, subscription contract) and `@speedytables/svelte` (runes adapter + `Table.*` components). The compute layer is framework-agnostic by necessity anyway — workers can't run runes, and reactive proxies over 1M rows are a perf anti-pattern.

The adapter contract is **per-slice subscriptions with window-sized payloads**: the core never asks a framework to be fine-grained over the dataset, only over the ~40-row window, so a coarse "window changed" signal is cheap to diff in any framework. This is what keeps adapters thin and avoids the classic external-store-adapter weakness (cf. TanStack Table's Svelte adapter).

## Considered options

- **Single package with lint-enforced `core/` folder boundary** — rejected once adapters became a goal: the boundary would be honor-system during the phase the contract churns most.
- **Runes throughout the core** — rejected: forfeits the worker executor and binds the pipeline to Svelte's compiler.
