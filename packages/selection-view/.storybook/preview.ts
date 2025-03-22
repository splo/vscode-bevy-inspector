import type { Preview } from '@storybook/react';
import '@vscode-elements/webview-playground';
import { VsCodeApiMock } from '../src/stories/vscodeApiMock';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default preview;

window.vscodeApiMock = new VsCodeApiMock();

window.acquireVsCodeApi = () => {
  return window.vscodeApiMock;
};
