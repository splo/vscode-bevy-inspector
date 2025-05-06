import type { EventMessage, RequestMessage } from '../messenger/types';
import type { Entity, Resource } from './types';

export const EntitySelected = 'EntitySelected';
export const ResourcesUpdated = 'ResourcesUpdated';

export interface EntitySelectedData {
  entity: Entity;
}

export interface ResourcesUpdatedData {
  resources: Resource[];
}

export type EntitySelectedEvent = EventMessage<EntitySelectedData> & {
  type: typeof EntitySelected;
};

export type ResourcesUpdatedEvent = EventMessage<ResourcesUpdatedData> & {
  type: typeof ResourcesUpdated;
};

export type InspectorEvent = EntitySelectedEvent | ResourcesUpdatedEvent;

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
