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
      exclude: ['node_modules', '__test__', 'mock_server', 'assets'],
      extension: ['.ts', '.tsx'],
      cypress: true
    })
  ],
  build: {
    outDir: 'build'
  },
  server: {
    port: 3000,
    watch: {
      ignored: ['**/coverage/**', '**/cypress/**']
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
