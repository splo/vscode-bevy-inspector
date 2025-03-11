/// <reference types="vitest/config" />
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
      { find: '@bevy-inspector/messenger', replacement: fileURLToPath(new URL('../messenger', import.meta.url)) },
      { find: '@bevy-inspector/inspector-messages', replacement: fileURLToPath(new URL('../inspector-messages', import.meta.url)) },
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
  test: {
    include: ['tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: 'tests/setup.ts',
    browser: {
      enabled: true,
      provider: 'playwright',
      // https://vitest.dev/guide/browser/playwright
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
});
