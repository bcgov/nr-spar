/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__test__/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'cobertura', 'html'],
      // Some legacy suites fail; still emit lcov so Sonar sees unit-test coverage.
      reportOnFailure: true
    }
  }
});