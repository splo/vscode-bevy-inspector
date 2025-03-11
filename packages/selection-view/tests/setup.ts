import { WebviewApi } from 'vscode-webview';

// VSCode Elements `vscode-icon` requires the codicon stylesheet to be loaded in the document.
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/codicon.css';
link.id = 'vscode-codicon-stylesheet';
document.head.appendChild(link);

class VsCodeApiMock implements WebviewApi<unknown> {
  public handler: (message: unknown) => void = console.log;

  constructor() {
    // Bind the postMessage method to the current instance.
    this.postMessage = this.postMessage.bind(this);
  }

  public postMessage(message: unknown) {
    this.handler(message);
  }

  public getState() {
    const state = sessionStorage.getItem('vscodeState');
    return state ? JSON.parse(state) : undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setState(newState: any) {
    sessionStorage.setItem('vscodeState', JSON.stringify(newState));
    return newState;
  }
}

declare global {
  interface Window {
    vscodeApiMock: VsCodeApiMock;
  }
}

window.vscodeApiMock = new VsCodeApiMock();

window.acquireVsCodeApi = () => {
  return window.vscodeApiMock;
};
