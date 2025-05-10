import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { BrpSchema, Reference } from '../../brp/brp-0.16';
import type { V0_16BevyRemoteService } from '../../brp/http/v0_16JsonRpcBrp';
import type {
  BevyJsonSchema,
  BevyJsonSchemaDefinition,
  BevyRootJsonSchema,
  TypePath,
} from '../../inspector-data/types';
import { shortenTypePath } from './schemas';

export class RemoteSchemaService {
  private brp: V0_16BevyRemoteService;
  private cachedSchema: BevyRootJsonSchema | null = null;

  constructor(brp: V0_16BevyRemoteService) {
    this.brp = brp;
  }

  public async getTypeSchema(typePath: TypePath): Promise<BevyJsonSchemaDefinition> {
    if (this.cachedSchema === null) {
      console.debug('Cache miss for schema');
      const registry = await this.brp.registrySchema();
      const schema = toJsonSchema(registry);
      const fixedSchema = fixDocument(schema);
      const derefSchema = await dereferenceSchema(fixedSchema);
      this.cachedSchema = derefSchema;
    } else {
      console.debug('Cache hit for schema');
    }
    // If missing type schema, return a default one, used for error details.
    return this.cachedSchema.$defs[typePath] || { typePath, shortPath: shortenTypePath(typePath) };
  }

  public invalidateCache() {
    this.cachedSchema = null;
    console.debug('Schema cache invalidated');
  }
}

function toJsonSchema(registry: Record<TypePath, BrpSchema>): BevyRootJsonSchema {
  return {
    $defs: Object.fromEntries(
      Object.entries(registry).map(([key, value]: [TypePath, BrpSchema]) => {
        const definition = toDefinition(value);
        definition.shortPath = value.shortPath;
        definition.typePath = value.typePath;
        return [key, definition as BevyJsonSchemaDefinition];
      }),
    ),
  };
}

function toDefinition(schema: BrpSchema): BevyJsonSchema {
  switch (schema.kind) {
    case 'Value': {
      switch (schema.type) {
        case 'boolean':
          return {
            type: 'boolean',
          };
        case 'float':
          return {
            type: 'number',
          };
        case 'int':
          return {
            type: 'number',
            multipleOf: 1,
            minimum: intMin(schema.typePath),
            maximum: intMax(schema.typePath),
          };
        case 'uint':
          return {
            type: 'number',
            multipleOf: 1,
            minimum: 0,
            maximum: uintMax(schema.typePath),
          };
        case 'string':
          return {
            type: 'string',
          };
        case 'object':
          return {
            type: 'object',
          };
      }
    }
    // Falls through.
    case 'List':
    case 'Array':
      return {
        type: 'array',
        items: (schema.items as Reference)?.type,
      };
    case 'Struct': {
      const properties = Object.fromEntries(
        Object.entries(schema.properties || {}).map(([key, value]) => [key, value.type]),
      );
      return {
        type: 'object',
        required: schema.required || [],
        properties,
      };
    }
    case 'Tuple': {
      const items = (schema.prefixItems || []).map((ref) => ref.type);
      return {
        type: 'array',
        items,
      };
    }
    case 'TupleStruct':
      return {
        $ref: (schema.prefixItems || [])[0]?.type.$ref,
      };
    case 'Set': {
      return {
        type: 'array',
        items: (schema.items as Reference)?.type,
      };
    }
    case 'Map':
      return {
        type: 'object',
        additionalProperties: schema.valueType?.type,
      };
    case 'Enum': {
      const oneOf: BevyJsonSchema[] = (schema.oneOf || []).map((value: string | BrpSchema) => {
        if (typeof value === 'string') {
          return {
            type: 'string',
            const: value,
            title: value,
          };
        } else if (!value.kind) {
          return {
            type: 'string',
            const: value.shortPath,
            title: value.shortPath,
          };
        } else if (value.kind === 'Tuple') {
          const properties: Record<string, BevyJsonSchema> = {};
          properties[value.shortPath] = (value.prefixItems || []).map((ref) => ref.type)[0];
          return {
            type: 'object',
            required: [value.shortPath],
            properties,
            title: value.shortPath,
          };
        } else {
          // if (value.kind === 'Struct')
          const properties = Object.fromEntries(
            Object.entries(schema.properties || {}).map(([key, value]) => [key, value.type]),
          );
          return {
            type: 'object',
            required: schema.required || [],
            properties,
            title: schema.shortPath,
          };
        }
      });
      return { oneOf };
    }
  }
}

function intMin(typePath: TypePath): number {
  switch (typePath) {
    case 'i8':
      return -128;
    case 'i16':
      return -32768;
    case 'i32':
      return -2147483648;
    case 'i64':
      // Should be -9223372036854775808 ...
      return Number.MIN_SAFE_INTEGER;
    case 'i128':
      // Should be -170141183460469231731687303715884105728 ...
      return Number.MIN_VALUE;
    default:
      return 0;
  }
}

function intMax(typePath: TypePath): number {
  switch (typePath) {
    case 'i8':
      return 128;
    case 'i16':
      return 32768;
    case 'i32':
      return 2147483648;
    case 'i64':
      // Should be 9223372036854775808 ...
      return Number.MAX_SAFE_INTEGER;
    case 'i128':
      // Should be 170141183460469231731687303715884105728 ...
      return Number.MAX_VALUE;

    default:
      return 0;
  }
}

function uintMax(typePath: TypePath): number {
  switch (typePath) {
    case 'u8':
      return 255;
    case 'u16':
      return 65535;
    case 'u32':
      return 4294967295;
    case 'u64':
      // Should be 18446744073709551615 ...
      return Number.MAX_SAFE_INTEGER;
    case 'u128':
      // Should be 340282366920938463463374607431768211455 ...
      return Number.MAX_VALUE;
    default:
      return 0;
  }
}

function fixDocument(document: BevyRootJsonSchema): BevyRootJsonSchema {
  // Add missing TypeId type.
  if (!document.$defs['core::any::TypeId']) {
    document.$defs['core::any::TypeId'] = {
      $ref: '#/$defs/u128',
      typePath: 'core::any::TypeId',
      shortPath: 'TypeId',
    };
  }
  // Fix some definitions.
  document.$defs = Object.fromEntries(
    Object.entries(document.$defs).map(([name, definition]: [string, BevyJsonSchema]) => {
      const [newName, newDefinition] = fixDefinition([name, definition]);
      newDefinition.typePath = definition.typePath;
      newDefinition.shortPath = definition.shortPath;
      return [newName, newDefinition as BevyJsonSchemaDefinition];
    }),
  );
  return document;
}

function fixDefinition([name, definition]: [string, BevyJsonSchema]): [string, BevyJsonSchema] {
  if (typeof definition === 'boolean') {
    return [name, definition];
  }
  // Replace Option::None values from 'None' to null.
  if (name.startsWith('core::option::Option')) {
    definition.oneOf = definition.oneOf?.map((oneOfDef) => {
      if (typeof oneOfDef === 'boolean') {
        return oneOfDef;
      }
      if (oneOfDef.const === 'None') {
        return {
          type: 'null',
          const: null,
          title: 'None',
        };
      } else {
        // @ts-expect-error #ref is defined in Some.
        const ref: string = oneOfDef.properties!.Some.$ref;
        const title = shortenTypePath(ref.substring(8)); // Strip the "#/$defs/" prefix.
        return { $ref: ref, title };
      }
    });
    return [name, definition];
  } else {
    switch (name) {
      case 'bevy_ecs::name::Name':
      case 'alloc::borrow::Cow<str>':
      case 'smol_str::SmolStr':
      case 'uuid::Uuid':
      case 'std::path::PathBuf':
      case 'bevy_asset::path::AssetPath':
      case 'bevy_asset::render_asset::RenderAssetUsages':
        return [name, { type: 'string' }];
      case 'bevy_ecs::entity::Entity':
        return [name, { $ref: '#/$defs/u64' }];
      case 'core::num::NonZeroI16':
        return [name, { $ref: '#/$defs/i16' }];
      case 'core::num::NonZeroU16':
        return [name, { $ref: '#/$defs/u16', minimum: 1 }];
      case 'core::num::NonZeroU32':
        return [name, { $ref: '#/$defs/u32', minimum: 1 }];
      case 'core::ops::Range<f32>':
        return [
          name,
          {
            type: 'object',
            properties: {
              start: { $ref: '#/$defs/f32' },
              end: { $ref: '#/$defs/f32' },
            },
            required: ['start', 'end'],
          },
        ];
      case 'core::ops::Range<u32>':
        return [
          name,
          {
            type: 'object',
            properties: {
              start: { $ref: '#/$defs/u32' },
              end: { $ref: '#/$defs/u32' },
            },
            required: ['start', 'end'],
          },
        ];
      case 'core::time::Duration':
        return [
          name,
          {
            type: 'object',
            properties: {
              nanos: { $ref: '#/$defs/u32' },
              secs: { $ref: '#/$defs/u32' },
            },
            required: ['nanos', 'secs'],
          },
        ];
      case 'glam::Vec2':
        return [
          name,
          {
            type: 'array',
            items: { $ref: '#/$defs/f32' },
            minItems: 2,
            maxItems: 2,
          },
        ];
      case 'glam::Vec3':
        return [
          name,
          {
            type: 'array',
            items: { $ref: '#/$defs/f32' },
            minItems: 3,
            maxItems: 3,
          },
        ];
      case 'glam::Vec4':
      case 'glam::Quat':
        return [
          name,
          {
            type: 'array',
            items: { $ref: '#/$defs/f32' },
            minItems: 4,
            maxItems: 4,
          },
        ];
    }
  }
  return [name, definition];
}

async function dereferenceSchema(schema: BevyRootJsonSchema): Promise<BevyRootJsonSchema> {
  const derefSchema = await $RefParser.dereference<BevyRootJsonSchema>(schema);
  // Restore 'typePath' and 'shortPath' overwritten by dereference.
  derefSchema.$defs = Object.fromEntries(
    Object.entries(derefSchema.$defs || {}).map(([name, definition]: [TypePath, BevyJsonSchemaDefinition]) => {
      if (definition.typePath !== name) {
        definition.typePath = name;
        definition.shortPath = shortenTypePath(name);
      }
      return [name, definition];
    }),
  );
  return derefSchema;
}
