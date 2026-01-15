import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  // Force Vite to output into /build instead of /dist
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  plugins: [react()],
})
