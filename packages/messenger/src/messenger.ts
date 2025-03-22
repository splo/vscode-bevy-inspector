/// <reference lib="dom" />
import type { EventMessage, RequestMessage, ResponseMessage } from './types';

export class Messenger extends EventTarget {
  private requestResolvers = new Map<string, (data: unknown) => void>();
  private requestSender;

  public constructor(requestSender: (request: RequestMessage<unknown>) => void) {
    super();
    this.requestSender = requestSender;
  }

  public sendRequest<T = unknown>(type: string, data: unknown): Promise<T> {
    return new Promise((resolve) => {
      const requestId = crypto.randomUUID();
      this.requestResolvers.set(requestId, resolve as (value: unknown) => void);
      const request: RequestMessage<unknown> = { id: requestId, type, data };
      this.requestSender(request);
    });
  }

  public subscribeToEvent<T = unknown>(type: string): Promise<T> {
    return new Promise((resolve) => {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent<T>;
        resolve(customEvent.detail);
        this.removeEventListener(type, handler);
      };
      this.addEventListener(type, handler);
    });
  }

  public handleIncomingMessage(message: unknown) {
    console.debug('View received message:', message);
    if (typeof message === 'object' && message !== null) {
      const messengerMessage = message as ResponseMessage<unknown> | EventMessage<unknown>;
      if ('requestId' in messengerMessage) {
        // Resolve the pending request promise.
        const callback = this.requestResolvers.get(messengerMessage.requestId);
        if (callback) {
          callback(messengerMessage.data);
          this.requestResolvers.delete(messengerMessage.requestId);
        }
      } else if ('type' in messengerMessage) {
        // Dispatch an event for all listeners.
        this.dispatchEvent(new CustomEvent(messengerMessage.type, { detail: messengerMessage.data }));
      }
    }
  }
}
