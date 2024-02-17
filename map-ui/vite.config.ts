import { sveltekit } from '@sveltejs/kit/vite';
import type { ViteDevServer } from 'vite';
import { defineConfig } from 'vitest/config';

const o1jsHeaders = () => ({
  name: 'configure-server',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((_req, res, next) => {
				res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
				res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
				next()
    })
  },
});

export default defineConfig({
	build: {
		target: 'esnext'
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext'
		},
	},
	plugins: [
		o1jsHeaders(),
		sveltekit(),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
