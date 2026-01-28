import { defineConfig } from 'vite'
import pages from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'

export default defineConfig(({ mode }) => {
  // Client bundle (assets)
  if (mode === 'client') {
    return {
      base: '/',
      build: {
        outDir: 'dist',
        emptyOutDir: false, // IMPORTANT: keep SSR output
        rollupOptions: {
          input: {
            client: 'src/client/index.ts',
            admin: 'src/client/admin.ts',
          },
          output: {
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name].[ext]',
          },
        },
      },
    }
  }

  // Default build (SSR/Worker for Cloudflare Pages)
  return {
    base: '/',
    plugins: [
      pages(),
      devServer({
        entry: 'src/index.tsx',
      }),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
