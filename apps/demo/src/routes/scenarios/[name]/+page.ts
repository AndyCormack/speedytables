import { error } from '@sveltejs/kit';
import { scenarios } from '$lib/scenarios';
import type { PageLoad } from './$types';

// Benchmark pages are client-only: measurements need a real browser, and SSR-ing
// a grid shell would pollute first-paint timings.
export const ssr = false;
export const prerender = false;

export const load: PageLoad = ({ params }) => {
	const scenario = scenarios[params.name];
	if (!scenario) error(404, `Unknown scenario: ${params.name}`);
	return { scenario };
};
