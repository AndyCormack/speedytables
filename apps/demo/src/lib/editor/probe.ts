/**
 * Reads a theme's resolved token values (and color-scheme) at runtime via a
 * probe element — zero duplication with the theme CSS files. The caller must
 * have the theme stylesheets imported.
 */
import { TOKENS } from '@speedytables/svelte';

export interface ProbedTheme {
	tokens: Record<string, string>;
	colorScheme: string;
}

export function probeTheme(themeId: string): ProbedTheme {
	const el = document.createElement('div');
	el.setAttribute('data-speedy-theme', themeId);
	el.style.position = 'absolute';
	el.style.visibility = 'hidden';
	document.body.appendChild(el);
	const style = getComputedStyle(el);
	const tokens: Record<string, string> = {};
	for (const spec of TOKENS) {
		tokens[spec.name] = style.getPropertyValue(spec.name).trim() || spec.default;
	}
	const colorScheme = style.colorScheme || 'dark';
	el.remove();
	return { tokens, colorScheme };
}

/** Resolves any CSS color expression to a concrete color via the probe pattern. */
export function resolveColor(expression: string, contextThemeId: string): string {
	const el = document.createElement('div');
	el.setAttribute('data-speedy-theme', contextThemeId);
	el.style.position = 'absolute';
	el.style.visibility = 'hidden';
	el.style.color = expression;
	document.body.appendChild(el);
	const resolved = getComputedStyle(el).color;
	el.remove();
	return resolved;
}
