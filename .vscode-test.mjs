import { defineConfig } from '@vscode/test-cli';
import { tmpdir } from 'node:os';

export default defineConfig({
  files: 'tests/**/*.test.js',
  launchArgs: ['--user-data-dir', `${tmpdir()}`],
});
