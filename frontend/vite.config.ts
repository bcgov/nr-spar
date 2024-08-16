import { fileURLToPath, URL } from 'node:url';
import { ConfigEnv, defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  const config: UserConfig = {
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
      react(),
      istanbul({
        extension: ['.ts', '.tsx'],
        cypress: true
      })
    ],
    build: {
      outDir: 'build',
      sourcemap: true
    },
    server: {
      port: 3000,
      watch: {
        ignored: ['**/coverage/**', '**/cypress-coverage/**', '**/cypress/**']
      }
    },
    preview: {
        port: 3000
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };

  if (mode === 'development') {
    if (config.define) {
      config.define.global = {};
    }
  }

  return config;
});
