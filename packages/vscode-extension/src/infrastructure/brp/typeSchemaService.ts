import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { JSONSchema7 } from 'json-schema';
import type { BevyJsonSchema, TypePath } from '@bevy-inspector/inspector-data/types';
import type { Reference, Schema } from './brp';

export class TypeSchemaService {
  private cachedSchema: BevyJsonSchema | null = null;

  // https://github.com/bevyengine/disqualified/blob/cc4940da85aa64070a34da590ff5aab12e7c951d/src/short_name.rs#L50
  public static shortenName(name: string): string {
    return name.replaceAll(/\w*::/g, '');
  }

  public async getTypeSchema(
    typePath: string,
    registryFetcher: () => Promise<Record<TypePath, Schema>>,
  ): Promise<BevyJsonSchema> {
    if (this.cachedSchema === null) {
      console.debug('Cache miss for schema');
      const registry = await registryFetcher();
      const schema = toJsonSchema(registry);
      const fixedSchema = fixDocument(schema);
      this.cachedSchema = await $RefParser.dereference(fixedSchema);
    } else {
      console.debug('Cache hit for schema');
    }
    const definitions = this.cachedSchema?.$defs as Record<TypePath, BevyJsonSchema> | undefined;
    return definitions?.[typePath] || { typePath, shortPath: TypeSchemaService.shortenName(typePath) };
  }

  public invalidateCache() {
    this.cachedSchema = null;
    console.debug('Cache invalidated');
  }
}

function toJsonSchema(registry: Record<TypePath, Schema>): BevyJsonSchema {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $defs: Object.fromEntries(
      Object.entries(registry).map(([key, value]) => {
        const definition = toDefinition(value);
        definition.shortPath = value.shortPath;
        definition.typePath = value.typePath;
        return [key, definition];
      }),
    ),
  };
}

function toDefinition(schema: Schema): BevyJsonSchema {
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
      const oneOf: JSONSchema7[] = (schema.oneOf || []).map((value: string | Schema) => {
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
          const properties: Record<string, JSONSchema7> = {};
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
      const enumSchema: BevyJsonSchema = {
        oneOf,
      };
      // const types = [
      //   ...new Set(
      //     oneOf
      //       .map((element) => element.type as JSONSchema7TypeName)
      //       .filter((type) => type !== undefined && typeof type !== 'boolean'),
      //   ),
      // ];
      // switch (types.length) {
      //   case 0:
      //     break;
      //   case 1:
      //     enumSchema.type = types[0];
      //     break;
      //   default:
      //     enumSchema.type = types;
      // }
      return enumSchema;
    }
  }
}

function intMin(typePath: string): number {
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

function intMax(typePath: string): number {
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

function uintMax(typePath: string): number {
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

function fixDocument(document: BevyJsonSchema): BevyJsonSchema {
  // Let TypeScript stop complaining about possibly undefined $defs.
  if (!document.$defs) {
    document.$defs = {};
  }
  // Add missing TypeId type.
  if (!document.$defs['core::any::TypeId']) {
    document.$defs['core::any::TypeId'] = {
      $ref: '#/$defs/u128',
    };
  }
  // Fix some definitions.
  document.$defs = Object.fromEntries(
    Object.entries(document.$defs).map(([name, definition]: [string, BevyJsonSchema]) => {
      const [newName, newDefinition] = fixDefinition([name, definition]);
      newDefinition.typePath = definition.typePath;
      newDefinition.shortPath = definition.shortPath;
      return [newName, newDefinition];
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
        const title = TypeSchemaService.shortenName(ref.substring(8));
        return { $ref: ref, title };
      }
    });
    // def.type = [...new Set(def.oneOf?.map((element) => (element as JSONSchema7).type as JSONSchema7TypeName))];
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
