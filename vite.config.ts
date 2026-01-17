import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Force Vite to output into /build instead of /dist
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  plugins: [
    build({
      entry: 'src/index.tsx',
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx',
    }),
    react()
  ],
})
