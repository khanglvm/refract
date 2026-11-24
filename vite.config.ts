import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// The whole package is a client module (context, external store, effects). Rollup drops source
// directives, so the build strips them and re-adds "use client" as an output banner on every chunk.
export default defineConfig({
  plugins: [
    {
      name: 'client-directive',
      enforce: 'pre',
      transform(code) {
        return { code: code.replace(/^(['"])use client\1;?/, (directive) => ' '.repeat(directive.length)), map: null }
      }
    },
    dts({ insertTypesEntry: true, include: ['src/**/*'] })
  ],
  build: {
    lib: { entry: { index: resolve(__dirname, 'src/index.ts') }, formats: ['es'] },
    rollupOptions: {
      external: (id) => id === 'immer' || /^(react|react-dom)(\/|$)/.test(id),
      output: {
        banner: '"use client";',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js'
      }
    }
  }
})
