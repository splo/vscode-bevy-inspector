import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: '@bevy-inspector', replacement: fileURLToPath(new URL('src', import.meta.url)) }],
  },
  build: {
    outDir: 'dist/selection-view',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  esbuild: {
    legalComments: 'none',
  },
});
