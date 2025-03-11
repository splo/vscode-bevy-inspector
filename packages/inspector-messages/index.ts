import type { RequestMessage } from '@bevy-inspector/messenger/types';
import type { JSONSchema7 } from 'json-schema';

export interface Entity {
  id: number;
  name: string | undefined;
}

export interface Component {
  typePath: string;
  shortPath: string;
  value: unknown;
  error?: string;
}

export enum InspectorMessage {
  EntitySelected = 'EntitySelected',
  ListComponents = 'ListComponents',
  GetSchema = 'GetSchema',
  SetComponentValue = 'SetComponentValue',
}

export interface EntitySelectedData {
  entity: Entity;
}

export interface ListComponentsRequestData {
  entityId: number;
}

export interface ListComponentsResponseData {
  components: Component[];
}

export interface GetSchemaRequestData {
  componentTypePath: string;
}

export interface GetSchemaResponseData {
  schema: JSONSchema7;
}

export interface SetComponentValueRequestData {
  entityId: number;
  typePath: string;
  newValue: unknown;
}

export interface SetComponentValueResponseData {
  success: boolean;
}

export type InspectorRequest =
  | (RequestMessage<ListComponentsRequestData> & { type: InspectorMessage.ListComponents })
  | (RequestMessage<GetSchemaRequestData> & { type: InspectorMessage.GetSchema })
  | (RequestMessage<SetComponentValueRequestData> & { type: InspectorMessage.SetComponentValue });
