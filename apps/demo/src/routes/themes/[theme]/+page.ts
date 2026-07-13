import { error } from '@sveltejs/kit';
import { THEMES } from '$lib/themes';
import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: PageLoad = ({ params }) => {
	const theme = THEMES.find((t) => t.id === params.theme);
	if (!theme) error(404, `Unknown theme: ${params.theme}`);
	return { theme };
};
