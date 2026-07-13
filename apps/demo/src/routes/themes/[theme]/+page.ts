import { error } from '@sveltejs/kit';
import { resolveTheme } from '$lib/themes';
import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = false;

export type { ResolvedTheme } from '$lib/themes';

// saved themes live in localStorage; this load runs client-side only
export const load: PageLoad = ({ params }) => {
	const theme = resolveTheme(params.theme);
	if (!theme) error(404, `Unknown theme: ${params.theme}`);
	return { theme };
};
