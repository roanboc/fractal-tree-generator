import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Separate from vite.config.ts on purpose: the web build's root is pages/,
// but tests live in tests/ at the repository root.
export default defineConfig({
  test: {
    dir: 'tests',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
