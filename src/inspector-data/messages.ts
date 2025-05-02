import type { EventMessage, RequestMessage } from '../messenger/types';
import type { Entity, Resource } from './types';

export const SelectionChanged = 'SelectionChanged';

export type SelectionChangedData =
  | { type: 'NonInspectable' }
  | { type: 'Resource'; resource: Resource }
  | { type: 'Entity'; entity: Entity };

export type SelectionChangedEvent = EventMessage<SelectionChangedData> & {
  type: typeof SelectionChanged;
};

export type InspectorEvent = SelectionChangedEvent;

export const SetComponentValue = 'SetComponentValue';
export const SetResourceValue = 'SetResourceValue';

export interface SetComponentValueRequestData {
  entityId: number;
  typePath: string;
  path: string;
  newValue: unknown;
}

export interface SetComponentValueResponseData {
  success: boolean;
  error?: string;
}

export interface SetResourceValueRequestData {
  typePath: string;
  path: string;
  newValue: unknown;
}

export interface SetResourceValueResponseData {
  success: boolean;
  error?: string;
}

export type InspectorRequest =
  | (RequestMessage<SetComponentValueRequestData> & { type: typeof SetComponentValue })
  | (RequestMessage<SetResourceValueRequestData> & { type: typeof SetResourceValue });
