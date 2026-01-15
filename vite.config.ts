import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  // Force Vite to output into /build instead of /dist
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  plugins: [react()],
})
