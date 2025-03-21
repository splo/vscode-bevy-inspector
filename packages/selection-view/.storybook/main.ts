import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {},
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  previewHead: (head) => `${head}<link rel="stylesheet" href="codicon.css" id="vscode-codicon-stylesheet" />`,
  previewBody: (body) => `<vscode-dev-toolbar></vscode-dev-toolbar>${body}`,
};
export default config;
