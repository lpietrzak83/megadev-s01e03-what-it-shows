import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [sveltekit({
    extensions: ['.svelte', '.svx'],
    preprocess: [mdsvex({
      extensions: ['.svx'],
      layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) }
    })],
    adapter: adapter({ pages: 'rendered', assets: 'rendered' })
  })]
});
