import type { EventMessage, TypedValue, TypePath } from './types';

// Events passing from the views to the extension.
export const ViewReady = 'ViewReady';
export const UpdateRequested = 'UpdateRequested';
export const CollapsibleStateChanged = 'CollapsibleStateChanged';
export type ViewReadyData = null;
export interface UpdateRequestedData {
  typePath: TypePath;
  path: string;
  newValue: unknown;
}
export interface CollapsibleStateData {
  anyExpanded: boolean;
}
export type ViewReadyEvent = EventMessage<ViewReadyData> & {
  type: typeof ViewReady;
};
export type UpdateRequestedEvent = EventMessage<UpdateRequestedData> & {
  type: typeof UpdateRequested;
};
export type CollapsibleStateChangedEvent = EventMessage<CollapsibleStateData> & {
  type: typeof CollapsibleStateChanged;
};
export type ViewEvent = ViewReadyEvent | UpdateRequestedEvent | CollapsibleStateChangedEvent;

// Events passing from the extension to the views.
export const ValuesUpdated = 'ValuesUpdated';
export const SetCollapsibleState = 'SetCollapsibleState';
export type ValuesUpdatedData = TypedValue[];
export type ValuesUpdatedEvent = EventMessage<ValuesUpdatedData> & {
  type: typeof ValuesUpdated;
};
export type SetCollapsibleStateEvent = EventMessage<CollapsibleStateData> & {
  type: typeof SetCollapsibleState;
};
export type ExtensionEvent = ValuesUpdatedEvent | SetCollapsibleStateEvent;
