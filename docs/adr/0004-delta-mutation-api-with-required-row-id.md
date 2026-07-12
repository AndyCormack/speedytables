# Mutations via delta API keyed by a required row id

The O(log N) incremental-update goal is only achievable if the grid knows *exactly which rows changed*. Svelte instincts say "just mutate a reactive array," but detecting what changed in an arbitrary array is an O(N) diff per change — the incremental path would silently degrade. So mutations go through an explicit `applyDelta({ insert, update, remove })` keyed by a mandatory consumer-supplied row id; deltas coalesce per animation frame into one O(k log N) patch. Full array replacement (`setData`) remains as the deliberate O(N log N) reload path.

Mirrors AG Grid's `applyTransaction`, keeping live-update benchmark scenarios 1:1 comparable.
