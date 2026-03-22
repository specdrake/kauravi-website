import { defineConfig } from 'vite';

export default defineConfig({
  // Required for Wrangler / @cloudflare/vite-plugin tooling (expects a `plugins` array).
  plugins: [],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
