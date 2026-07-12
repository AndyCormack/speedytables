# Design

Visual system for the SpeedyTables demo app. The library itself is headless — every rule here styles the components' `data-speedy-*` attributes from the consuming app (currently the scenario page). Strategic context: [PRODUCT.md](PRODUCT.md).

## Theme

Instrument, not brochure: compact, crisp, engineered. Dark scheme app-wide (`color-scheme: dark` at the root — native controls, scrollbars, and popovers render dark): a monitoring-instrument register that suits streaming benchmarks. Deep blue-gray surfaces, never pure black. Restrained color strategy: neutral surfaces, one steel-teal accent carrying selection and state only. Minimal rounding (4px controls, 6px overlays). Density over airiness; the grid is the hero. AG Grid comparison pages run Quartz + `colorSchemeDark` for visual coherence.

## Colors (OKLCH)

App shell: `--app-bg oklch(0.16 0.01 255)`, `--app-ink oklch(0.93 0.005 250)`, `--app-ink-soft oklch(0.72 0.015 250)`, `--app-accent oklch(0.72 0.1 220)` (defined in `+layout.svelte`).

| Token | Value | Role |
| --- | --- | --- |
| `--st-ink` | `oklch(0.93 0.005 250)` | Primary text (≥12:1 on bg) |
| `--st-ink-soft` | `oklch(0.72 0.015 250)` | Secondary text, placeholders (≥4.5:1) |
| `--st-bg` | `oklch(0.195 0.012 255)` | Content surface |
| `--st-surface` | `oklch(0.235 0.012 255)` | Header/toolbar layer, row hover, popover |
| `--st-surface-hover` | `oklch(0.275 0.014 255)` | Hover on the surface layer |
| `--st-border` | `oklch(0.29 0.012 255)` | Hairlines (row separators) |
| `--st-border-strong` | `oklch(0.38 0.015 255)` | Structural borders, controls |
| `--st-accent` | `oklch(0.72 0.1 220)` | Sort state, active filters, focus, selection |
| `--st-accent-tint` | `oklch(0.3 0.05 220)` | Active-filter fill |

Deliberately not AG Quartz blue; the cool steel-teal is the identity color.

## Typography

One family: `system-ui` stack. Grid at 13px, controls at 12px, weight 600 for headers only. Numeric cells right-aligned with `font-variant-numeric: tabular-nums`. Fixed rem/px scale (product register — no fluid type).

## Components

- **Header cell** = sort button (label + ▲/▼ indicator, accent when sorted, `aria-sort`) stacked above an integrated filter control. No separate filter row.
- **Filter controls** by column kind: text → contains input with clear ×; number → Min/Max pair; enum → trigger + top-layer checkbox panel; `filter: 'none'` opts a column out.
- **Enum panel** uses the native Popover API (top layer — immune to grid clipping; light-dismiss + Esc built in), anchored under its trigger, with title + Reset header.
- **States**: every control has default / hover (accent border) / focus-visible (accent ring) / active-filter (accent border + tint). Focus rings always visible, never `outline: none` without replacement.

## Motion

150ms `cubic-bezier(0.165, 0.84, 0.44, 1)` (ease-out-quart) on control states; popover enters via `@starting-style` fade/4px-rise. All transitions disabled under `prefers-reduced-motion`. Nothing animates during scroll or data updates — performance is visible (PRODUCT.md).
