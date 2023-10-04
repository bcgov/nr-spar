import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'build-html',
      apply: 'build',
      transformIndexHtml: (html) => ({
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              src: '/env.js'
            },
            injectTo: 'head'
          }
        ]
      })
    },
    react(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', '__test__'],
      extension: ['.ts', '.tsx'],
      cypress: true,
      forceBuildInstrument: true
    })
  ],
  build: {
    outDir: 'build'
  },
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'cobertura', 'html']
    }
  }
});
