import type { Handle } from '@sveltejs/kit';

// Cross-origin isolation (see vite.config.ts note): required for
// performance.measureUserAgentSpecificMemory in the pipeline worker
// (workerHeapMB). Applied here because SvelteKit's preview/SSR responses
// bypass vite's `preview.headers`.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	return response;
};
