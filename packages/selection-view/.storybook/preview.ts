import type { Preview } from '@storybook/react';
import '@vscode-elements/webview-playground';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
