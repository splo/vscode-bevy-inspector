import type { WebviewApi } from 'vscode-webview';
import type { EventMessage } from '../inspector-data/types';
import { isEventMessage } from '../inspector-data/types';

export class VsCodeMessenger<T = unknown> {
  private vscodeApi: WebviewApi<T>;

  constructor(vscodeApi: WebviewApi<T>) {
    this.vscodeApi = vscodeApi;
  }

  public publishEvent<T>(event: EventMessage<T>) {
    this.vscodeApi.postMessage(event);
  }

  public subscribeToEvent<T>(type: string, handler: (event: EventMessage<T>) => void): () => void {
    const listener = (message: MessageEvent<EventMessage<T>>): void => {
      console.debug('Listener triggered:', message);
      if (isEventMessage(message.data) && message.data.type === type) {
        handler(message.data);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }
}

export const vscodeMessenger = new VsCodeMessenger(acquireVsCodeApi());
