import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type { import("eslint").Linter.Config[] } */
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  prettier,
  {
    name: '@bevy-inspector/prettier',
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    name: '@bevy-inspector/general',
    ignores: ['dist'],
    rules: {
      curly: 'warn',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
    },
  },
  {
    name: '@bevy-inspector/vscode-extension',
    files: ['packages/vscode-extension/**/*.ts'],
    ignores: ['packages/vscode-extension/{out,.vscode-test}/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
      ecmaVersion: 2023,
    },
  },
  {
    name: '@bevy-inspector/selection-view',
    files: ['packages/selection-view/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ignores: ['packages/selection-view/out/**/*'],
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      ecmaVersion: 2020,
    },
  },
);
