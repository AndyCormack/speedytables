import { redirect } from '@sveltejs/kit';

export const ssr = false;

export function load(): never {
	redirect(307, '/themes/graphite');
}
