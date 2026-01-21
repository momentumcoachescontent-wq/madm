import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pages from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  plugins: [
    react(),
    pages({
      entry: 'src/index.tsx'
    }),
    devServer({
      entry: 'src/index.tsx'
    })
  ],
});
