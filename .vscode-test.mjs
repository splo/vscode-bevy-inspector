import { defineConfig } from '@vscode/test-cli';
import { tmpdir } from 'node:os';

export default defineConfig({
  // extensionDevelopmentPath: 'packages/vscode-extension',
  files: 'packages/vscode-extension/out/test/**/*.test.js',
  launchArgs: ['--user-data-dir', `${tmpdir()}`],
});
