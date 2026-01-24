import { defineConfig } from 'vite'
import pages from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      pages(),
      devServer({
        entry: 'src/index.tsx'
      })
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  }
})
