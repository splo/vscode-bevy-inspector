import type { JSONSchema7 } from 'json-schema';

/** A unique identifier for an entity within a Bevy world. */
export type EntityId = number;
/** The full path that defines a type. */
export type TypePath = string;

export interface TypedValue {
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
