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
