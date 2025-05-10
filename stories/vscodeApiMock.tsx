import type { ValueUpdated } from '@bevy-inspector/schema-components/valueProps';
import type { WebviewApi } from 'vscode-webview';

declare global {
  interface Window {
    vscodeApiMock: VsCodeApiMock;
  }
}

export class VsCodeApiMock implements WebviewApi<unknown> {
  public handler: (message: unknown) => void = console.log;

  constructor() {
    // Bind the postMessage method to the current instance.
    this.postMessage = this.postMessage.bind(this);
  }

  public postMessage(message: unknown) {
    this.handler(message);
  }

  public getState(): unknown {
    const state = sessionStorage.getItem('vscodeState');
    return state ? JSON.parse(state) : undefined;
  }

  public setState<T>(newState: T): T {
    sessionStorage.setItem('vscodeState', JSON.stringify(newState));
    return newState;
  }
}

export const onValueChange = (event: ValueUpdated, rootValue: unknown) => {
  window.vscodeApiMock.postMessage({ function: 'onValueChange', event, rootValue });
};
