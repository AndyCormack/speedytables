import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Cross-origin isolation: everything the demo loads is same-origin, and COI
// enables performance.measureUserAgentSpecificMemory in the pipeline worker
// (the workerHeapMB metric) plus SharedArrayBuffer for future worker work.
// A plugin (registered before sveltekit) is required: an isolated document may
// only spawn workers whose script response itself carries COEP, and SvelteKit's
// dev/preview asset serving ignores vite's server/preview.headers config.
const crossOriginIsolation = {
	name: 'cross-origin-isolation',
	configureServer(server: { middlewares: { use(fn: unknown): void } }) {
		server.middlewares.use((_req: unknown, res: { setHeader(k: string, v: string): void }, next: () => void) => {
			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			next();
		});
	},
	configurePreviewServer(server: { middlewares: { use(fn: unknown): void } }) {
		server.middlewares.use((_req: unknown, res: { setHeader(k: string, v: string): void }, next: () => void) => {
			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			next();
		});
	}
};

export default defineConfig({
	plugins: [
		crossOriginIsolation,
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	]
});
