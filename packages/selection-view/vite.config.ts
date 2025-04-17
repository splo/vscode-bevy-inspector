import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { workspaceRootSync } from 'workspace-root';

const rootDir = workspaceRootSync();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@bevy-inspector/messenger', replacement: fileURLToPath(new URL('../messenger/out', import.meta.url)) },
      {
        find: '@bevy-inspector/inspector-data',
        replacement: fileURLToPath(new URL('../inspector-data/out', import.meta.url)),
      },
    ],
  },
  build: {
    outDir: `${rootDir}/dist/selection-view`,
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
