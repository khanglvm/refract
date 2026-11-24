import { defineConfig } from 'vite'
import { resolve } from 'path'

// Builds the landing page. The live demo imports the library source, so the page always runs the
// code in this checkout rather than a published version.
export default defineConfig({
  root: __dirname,
  resolve: { alias: { 'refract-state': resolve(__dirname, '../src/index.ts') } },
  esbuild: { jsx: 'automatic' },
  build: { outDir: resolve(__dirname, 'dist'), emptyOutDir: true }
})
