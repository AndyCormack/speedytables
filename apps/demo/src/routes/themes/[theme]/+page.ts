import { error } from '@sveltejs/kit';
import { getSaved } from '$lib/editor/saved';
import { THEMES, type ThemeEntry } from '$lib/themes';
import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = false;

export interface ResolvedTheme extends ThemeEntry {
	saved?: { base: string; overrides: Record<string, string>; rowHeight: number };
}

export const load: PageLoad = ({ params }) => {
	const builtIn = THEMES.find((t) => t.id === params.theme);
	if (builtIn) return { theme: builtIn as ResolvedTheme };

	// user-saved custom themes (localStorage; this load runs client-side only)
	const saved = getSaved(params.theme);
	if (saved) {
		const base = THEMES.find((t) => t.id === saved.base) ?? THEMES[0]!;
		const theme: ResolvedTheme = {
			id: saved.name,
			name: saved.name,
			blurb: `Your custom theme, based on ${base.name}.`,
			mechanism: 'tokens',
			paneBg: saved.overrides['--st-bg'] ?? base.paneBg,
			paneScheme: base.paneScheme,
			rowHeight: saved.rowHeight,
			saved: { base: saved.base, overrides: saved.overrides, rowHeight: saved.rowHeight }
		};
		return { theme };
	}
	error(404, `Unknown theme: ${params.theme}`);
};
