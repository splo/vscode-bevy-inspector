export interface RequestMessage<T> {
  id: string;
  type: string;
  data: T;
}

export interface ResponseMessage<T> {
  requestId: string;
  data: T;
}

export interface EventMessage<T> {
  type: string;
  data: T;
}

export function isEventMessage<T>(message: unknown): message is EventMessage<T> {
  return typeof message === 'object' && message !== null && 'type' in message && 'data' in message;
}
