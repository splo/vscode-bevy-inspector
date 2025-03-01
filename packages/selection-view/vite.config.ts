/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { workspaceRootSync } from 'workspace-root';

const rootDir = workspaceRootSync();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
