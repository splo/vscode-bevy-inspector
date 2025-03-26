import type { RequestMessage } from '@bevy-inspector/messenger/types';
import type { JSONSchema7 } from 'json-schema';

interface BevyJsonSchemaExtension {
  typePath: string;
  shortPath: string;
}

// Recursive type to extend JSONSchema7 with BevyJsonSchemaExtension
export type BevyJsonSchema = Omit<
  JSONSchema7,
  '$defs' | 'items' | 'additionalItems' | 'properties' | 'patternProperties' | 'additionalProperties'
> &
  BevyJsonSchemaExtension & {
    $defs?: Record<string, BevyJsonSchema>;
    items?: BevyJsonSchema | BevyJsonSchema[];
    additionalItems?: BevyJsonSchema;
    properties?: Record<string, BevyJsonSchema>;
    patternProperties?: Record<string, BevyJsonSchema>;
    additionalProperties?: BevyJsonSchema | boolean;
  };

export interface Entity {
  id: number;
  name: string | undefined;
}

export interface Component {
  value: unknown;
  error?: string;
  schema: BevyJsonSchema;
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
  schema: BevyJsonSchema;
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
