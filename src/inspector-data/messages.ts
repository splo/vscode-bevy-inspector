import type { EventMessage } from '../messages/types';
import type { TypedValue, TypePath } from './types';

export const ViewReady = 'ViewReady';
export const UpdateRequested = 'UpdateRequested';
export type ViewReadyData = null;
export interface UpdateRequestedData {
  typePath: TypePath;
  path: string;
  newValue: unknown;
}
export type ViewReadyEvent = EventMessage<ViewReadyData> & {
  type: typeof ViewReady;
};
export type UpdateRequestedEvent = EventMessage<UpdateRequestedData> & {
  type: typeof UpdateRequested;
};
export type ViewEvent = ViewReadyEvent | UpdateRequestedEvent;

export const ValuesUpdated = 'ValuesUpdated';
export type ValuesUpdatedData = TypedValue[];
export type ValuesUpdatedEvent = EventMessage<ValuesUpdatedData> & {
  type: typeof ValuesUpdated;
};
export type ExtensionEvent = ValuesUpdatedEvent;
