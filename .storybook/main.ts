import type { StorybookConfig } from '@storybook/react-vite';

const rootDir = new URL('..', import.meta.url).pathname;

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
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
  viteFinal: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@bevy-inspector': `${rootDir}/src`,
    };
    return config;
  },
  previewHead: (head) =>
    `${head}<link rel="stylesheet" href="node_modules/@vscode/codicons/dist/codicon.css" id="vscode-codicon-stylesheet" />`,
  previewBody: (body) => /* html */ `
  <vscode-dev-toolbar></vscode-dev-toolbar>
  <div style="font-size: smaller;
    background-color: #9e9e9e0d;
    border: 1px solid black;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 2;
    overflow: scroll;">
    <div>Latest message
    <button
      style="font-size: smaller; position: absolute; right: 0;"
      onclick="const output = document.getElementById('message-output'); output.style.display = output.style.display === 'none' ? 'block' : 'none';"
      >Toggle</button></div>
    <pre id="message-output"></pre>
  </div>
  ${body}
  `,
};
export default config;
