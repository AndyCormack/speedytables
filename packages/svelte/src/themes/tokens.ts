/**
 * The public token contract (ADR-0005): every shipped theme sets these; base.css
 * consumes them with the listed defaults. Additive-only after 1.0.
 * This manifest is the single schema for the docs and the theme editor (M8).
 */
export type TokenKind = 'color' | 'length' | 'shadow' | 'easing' | 'weight';
export type TokenGroup = 'surface' | 'ink' | 'border' | 'accent' | 'shape' | 'density' | 'motion';

export interface TokenSpec {
	name: `--st-${string}`;
	group: TokenGroup;
	kind: TokenKind;
	default: string;
	description: string;
}

export const TOKENS: readonly TokenSpec[] = [
	{ name: '--st-bg', group: 'surface', kind: 'color', default: 'oklch(0.195 0.012 255)', description: 'Content surface behind rows' },
	{ name: '--st-surface', group: 'surface', kind: 'color', default: 'oklch(0.235 0.012 255)', description: 'Header / toolbar layer and row hover' },
	{ name: '--st-surface-hover', group: 'surface', kind: 'color', default: 'oklch(0.275 0.014 255)', description: 'Hover on the surface layer' },
	{ name: '--st-panel', group: 'surface', kind: 'color', default: 'oklch(0.235 0.012 255)', description: 'Popover panels (filters, column menu)' },
	{ name: '--st-ink', group: 'ink', kind: 'color', default: 'oklch(0.93 0.005 250)', description: 'Primary text' },
	{ name: '--st-ink-soft', group: 'ink', kind: 'color', default: 'oklch(0.72 0.015 250)', description: 'Secondary text, placeholders (keep ≥4.5:1)' },
	{ name: '--st-border', group: 'border', kind: 'color', default: 'oklch(0.29 0.012 255)', description: 'Hairlines (row separators)' },
	{ name: '--st-border-strong', group: 'border', kind: 'color', default: 'oklch(0.38 0.015 255)', description: 'Structural borders and controls' },
	{ name: '--st-accent', group: 'accent', kind: 'color', default: 'oklch(0.72 0.1 220)', description: 'Sort state, active filters, focus, selection' },
	{ name: '--st-accent-ink', group: 'accent', kind: 'color', default: 'oklch(0.14 0.015 255)', description: 'Text on accent-filled elements' },
	{ name: '--st-accent-tint', group: 'accent', kind: 'color', default: 'oklch(0.3 0.05 220)', description: 'Active-filter fill' },
	{ name: '--st-radius', group: 'shape', kind: 'length', default: '4px', description: 'Controls (inputs, buttons)' },
	{ name: '--st-radius-panel', group: 'shape', kind: 'length', default: '6px', description: 'Popover panels' },
	{ name: '--st-focus-ring', group: 'accent', kind: 'shadow', default: '0 0 0 2px oklch(0.72 0.1 220 / 0.35)', description: 'Focus-visible ring' },
	{ name: '--st-shadow-panel', group: 'shape', kind: 'shadow', default: '0 2px 6px oklch(0 0 0 / 0.3), 0 8px 24px oklch(0 0 0 / 0.45)', description: 'Popover elevation' },
	{ name: '--st-font-size', group: 'density', kind: 'length', default: '13px', description: 'Grid text size' },
	{ name: '--st-pad-x', group: 'density', kind: 'length', default: '10px', description: 'Horizontal cell padding' },
	{ name: '--st-header-weight', group: 'density', kind: 'weight', default: '600', description: 'Header label weight' },
	{ name: '--st-header-transform', group: 'density', kind: 'weight', default: 'none', description: 'Header label text-transform' },
	{ name: '--st-header-tracking', group: 'density', kind: 'length', default: '0', description: 'Header label letter-spacing' },
	{ name: '--st-header-border', group: 'border', kind: 'shadow', default: '1px solid var(--st-border-strong)', description: 'Header bottom border (full border shorthand)' },
	{ name: '--st-row-border', group: 'border', kind: 'shadow', default: '1px solid var(--st-border)', description: 'Row separator (full border shorthand; none for borderless rows)' },
	{ name: '--st-row-odd-bg', group: 'surface', kind: 'color', default: 'var(--st-bg)', description: 'Odd-row background (zebra striping; keyed to absolute row index, not DOM position)' },
	{ name: '--st-cell-rule', group: 'border', kind: 'shadow', default: 'none', description: 'Vertical column rule on cells (full border shorthand)' },
	{ name: '--st-ease', group: 'motion', kind: 'easing', default: 'cubic-bezier(0.165, 0.84, 0.44, 1)', description: 'Transition easing (ease-out-quart)' }
] as const;
