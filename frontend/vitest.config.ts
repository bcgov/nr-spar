/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__test__/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'cobertura', 'html']
    }
  }
});
