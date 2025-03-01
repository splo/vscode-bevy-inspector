import { defineConfig } from '@vscode/test-cli';
import { tmpdir } from 'node:os';

export default defineConfig({
  files: 'packages/vscode-extension/out/test/**/*.test.js',
  srcDir: 'packages/vscode-extension/src',
  launchArgs: ['--user-data-dir', `${tmpdir()}`],
});
