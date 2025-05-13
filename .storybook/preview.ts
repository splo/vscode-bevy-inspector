import type { Preview } from '@storybook/react';
import '@vscode-elements/webview-playground';
import { VsCodeApiMock } from '../stories/vscodeApiMock';

const preview: Preview = {
  tags: [],
  parameters: {
    layout: 'centered',
  },
};

export default preview;

window.vscodeApiMock = new VsCodeApiMock();
window.vscodeApiMock.handler = (message) => {
  const messageOutputElement = document.getElementById('message-output');
  if (messageOutputElement) {
    messageOutputElement.textContent = JSON.stringify(message, null, 2);
  }
  window.postMessage(message);
};

// @ts-expect-error This is fine.
window.acquireVsCodeApi = () => window.vscodeApiMock;
