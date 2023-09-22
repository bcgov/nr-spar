import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    define: {} as any,
    plugins: [
      {
          name: 'build-html',
          apply: 'build',
          transformIndexHtml: (html) => {
            return {
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
            }
          }
        },
      react()
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
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true,
      reporters: ['verbose'],
      coverage: {
        provider: 'v8',
        reporter: ['lcov', 'cobertura', 'html'],
        include: ['src/**/*'],
        exclude: [],
      }
    }
  };

  if (mode === 'development') {
    config.define.global = {};
  }

  return config;
});
