// Checks that every built module keeps its client boundary for Next.js App Router.
import { readdirSync, readFileSync } from 'node:fs'

const dist = new URL('../dist/', import.meta.url)
const files = readdirSync(dist, { recursive: true }).filter((file) => String(file).endsWith('.js'))
if (!files.includes('index.js')) throw new Error('dist/index.js is missing')
for (const file of files) {
  if (!/^["']use client["'];/.test(readFileSync(new URL(String(file), dist), 'utf8'))) throw new Error(`${file} must start with "use client"`)
}
console.log(`Client directive present in ${files.length} modules`)
