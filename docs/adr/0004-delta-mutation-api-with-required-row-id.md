# Mutations via delta API keyed by a required row id

The O(log N) incremental-update goal is only achievable if the grid knows *exactly which rows changed*. Svelte instincts say "just mutate a reactive array," but detecting what changed in an arbitrary array is an O(N) diff per change — the incremental path would silently degrade. So mutations go through an explicit `applyDelta({ insert, update, remove })` keyed by a mandatory consumer-supplied row id; deltas coalesce per animation frame into one O(k log N) patch. Full array replacement (`setData`) remains as the deliberate O(N log N) reload path.

Mirrors AG Grid's `applyTransaction`, keeping live-update benchmark scenarios 1:1 comparable.

## Consequences (updated when implemented, v0.4.0)

- The shipped incremental path is a **single merge pass per frame** over the output index arrays — O(output + k log k) per flush with memcpy-grade constants — rather than the literal O(k log N) a tree-indexed structure would give. Chosen deliberately: at 1M rows the merge pass costs ~1–2ms/frame, and flat `Uint32Array`s keep the pipeline simple and worker-transferable (ADR-0002). Revisit only if benchmarks ever show the merge pass dominating a frame.
- Inserts/removes take the full-rebuild path in v1; only updates are incremental.
- `setData` shallow-copies the consumer's array: deltas patch the source in place, and that must never reach back into caller-owned data.
