# Design

Visual system for the SpeedyTables demo app. The library itself is headless — every rule here styles the components' `data-speedy-*` attributes from the consuming app (currently the scenario page). Strategic context: [PRODUCT.md](PRODUCT.md).

## Theme

Instrument, not brochure: compact, crisp, engineered. Light theme (benchmark evidence is read like a document — daylight register). Restrained color strategy: neutral surfaces, one steel-teal accent carrying selection and state only. Minimal rounding (4px controls, 6px overlays). Density over airiness; the grid is the hero.

## Colors (OKLCH)

| Token | Value | Role |
| --- | --- | --- |
| `--st-ink` | `oklch(0.28 0.015 255)` | Primary text (≥12:1 on bg) |
| `--st-ink-soft` | `oklch(0.45 0.02 255)` | Secondary text, placeholders (≥4.5:1) |
| `--st-bg` | `oklch(1 0 0)` | Content surface |
| `--st-surface` | `oklch(0.973 0.004 250)` | Header/toolbar layer, row hover |
| `--st-surface-hover` | `oklch(0.955 0.006 250)` | Hover on the surface layer |
| `--st-border` | `oklch(0.91 0.007 250)` | Hairlines (row separators) |
| `--st-border-strong` | `oklch(0.83 0.012 250)` | Structural borders, controls |
| `--st-accent` | `oklch(0.5 0.11 220)` | Sort state, active filters, focus, selection |
| `--st-accent-tint` | `oklch(0.96 0.02 220)` | Active-filter fill |

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
