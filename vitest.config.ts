import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['shared/**/*.test.ts', 'server/**/*.test.ts', 'app/**/*.test.ts'],
    globals: false
  },
  resolve: {
    alias: {
      '~~': here
    }
  }
})
