/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: "./",
  cacheDir: '../../node_modules/.vite/arrows-ts',

  server: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/api/share': 'http://localhost:3001',
      '/collab-ws': {
        target: 'ws://localhost:3002',
        ws: true,
        rewrite: (path) => path.replace(/^\/collab-ws/, '')
      }
    }
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  resolve: {
    alias: {
      'react-recompose': 'recompose',
    },
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
