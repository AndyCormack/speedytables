# Two-mechanism styling API: token themes + part-class maps

Themes needed a public API without breaking the headless contract. We ship two complementary mechanisms. (1) **Token themes**: one structural `base.css` plus small per-theme files that set documented `--st-*` custom properties, activated by `data-speedy-theme="<name>"` on any ancestor — multiple themes coexist on a page. (2) **Part-class maps**: components accept a `classes` object mapping named parts (headerCell, row, cell, …) to class strings, merged at element creation — this is what makes a real Tailwind theme possible (an exported preset of utility strings that composes with the consumer's own Tailwind config) and serves arbitrary class-based customization.

The **customization ladder** is: token override → arbitrary CSS against `data-speedy-*` attributes → part classes → snippet overrides → headless core. Function-critical inline styles (widths, box-sizing, transforms, overflow) deliberately beat stylesheets; wanting past them means rung 4.

## Considered options

- **Self-contained CSS per theme** — rejected: six copies of structural rules drift, and coexisting themes multiply selector weight.
- **JS theme objects generating CSS at runtime (AG v33 style)** — rejected: drags styling into the deliberately headless core and costs runtime injection.
- **Tailwind theme as build-time @apply CSS** — rejected: compiles against our config, not the consumer's, which defeats the purpose.

## Consequences

- The `--st-*` token set (~20 names) is a public contract: documented, additive-only after 1.0.
- Part-class strings are static per part, so they're written once at element creation — no per-frame cost; the claim is held to the same benchmark standard as everything else (recorded Tailwind-preset runs).
- The scenario/bench pages dogfood shipped theme #1; demo styling and theme #1 are one artifact.
