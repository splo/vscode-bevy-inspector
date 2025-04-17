import type { JSONSchema7 } from 'json-schema';

/** A unique identifier for an entity within a Bevy world. */

export type EntityId = number;
/** The full path that defines a type. */
export type TypePath = string;
/** A reference to an entity. */

export interface EntityRef {
  id: EntityId;
  name?: string;
  parentId?: EntityId;
  componentNames: TypePath[];
}
/** An entity with its components. */

export interface Entity {
  id: EntityId;
  name?: string;
  components: Component[];
}
/** An entity component with its value. */

export interface Component {
  value: unknown;
  error?: string;
  schema: BevyJsonSchemaDefinition;
}
/** A resource with its value. */

export interface Resource {
  value: unknown;
  error?: string;
  schema: BevyJsonSchemaDefinition;
}

interface BevyJsonSchemaExtension {
  typePath?: TypePath;
  shortPath?: string;
}

export interface BevyRootJsonSchema {
  $defs: Record<TypePath, BevyJsonSchemaDefinition>;
}

export type BevyJsonSchemaDefinition = BevyJsonSchema & {
  typePath: TypePath;
  shortPath: string;
};

/** Recursive type to extend JSONSchema7 with @type {BevyJsonSchemaExtension}. */
export type BevyJsonSchema = Omit<
  JSONSchema7,
  '$defs' | 'oneOf' | 'items' | 'additionalItems' | 'properties' | 'patternProperties' | 'additionalProperties'
> &
  BevyJsonSchemaExtension & {
    oneOf?: BevyJsonSchema[];
    items?: BevyJsonSchema | BevyJsonSchema[];
    additionalItems?: BevyJsonSchema;
    properties?: Record<string, BevyJsonSchema>;
    patternProperties?: Record<string, BevyJsonSchema>;
    additionalProperties?: BevyJsonSchema | boolean;
  };
