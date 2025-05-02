import { default as eslint, default as js } from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
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
    ignores: ['dist', 'out'],
    rules: {
      curly: 'warn',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    name: '@bevy-inspector/vscode-extension',
    files: ['src/extension/**/*.ts'],
    ignores: ['src/extension/{out,.vscode-test}/**/*'],
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
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/selection-view/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      ecmaVersion: 2020,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
