import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules/**', '.next/**', 'coverage/**'],
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
    clearMocks: true,
    // Windows + the React plugin's Babel transform can deadlock the default
    // "forks" pool (worker timeout). Threads are reliable here and still
    // give us isolation between test files.
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**', 'lib/**', 'components/**'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
