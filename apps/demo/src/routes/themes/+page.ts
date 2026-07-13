import { redirect } from '@sveltejs/kit';
import { pickedTheme } from '$lib/themes';

export const ssr = false;

// opening the gallery lands on your picked theme (localStorage; client-only load)
export function load(): never {
	redirect(307, `/themes/${encodeURIComponent(pickedTheme()?.id ?? 'graphite')}`);
}
