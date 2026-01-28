import { defineConfig } from 'vite'
import pages from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        client: 'src/client/index.ts',
        admin: 'src/client/admin.ts'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
}
  }

 return {
  base: '/',
  plugins: { ... },
  build: { ... }
}
