import type { BevyJsonSchema, BevyJsonSchemaDefinition, TypePath } from '../../inspector-data/types';
import { shortenTypePath } from './schemas';

export class ReflectionSchemaService {
  public createTypeSchema(typePath: TypePath, value: unknown): BevyJsonSchemaDefinition {
    return {
      typePath,
      shortPath: shortenTypePath(typePath),
      ...setReadOnly(toJsonSchema(typePath, value)),
    };
  }
}

function toJsonSchema(typePath: TypePath, value: unknown): BevyJsonSchema {
  if (typePath === 'bevy_transform::components::global_transform::GlobalTransform') {
    return globalTransform(typePath);
  }
  return valueToSchema(value);
}

function valueToSchema(value: unknown): BevyJsonSchema {
  switch (typeof value) {
    case 'undefined':
    case 'symbol':
    case 'function':
      return {
        type: 'null',
      };
    case 'boolean':
      return {
        type: 'boolean',
      };
    case 'number':
    case 'bigint':
      return {
        type: 'number',
      };
    case 'string':
      return {
        type: 'string',
      };
    case 'object': {
      if (value === null) {
        return {
          type: 'null',
        };
      }
      if (Array.isArray(value)) {
        return {
          type: 'array',
          items: value.map((item) => valueToSchema(item)),
        };
      }
      return {
        type: 'object',
        properties: Object.entries(value).reduce((result: Record<string, BevyJsonSchema>, [key, val]) => {
          result[key] = valueToSchema(val);
          return result;
        }, {}),
      };
    }
  }
}

function setReadOnly(schema: BevyJsonSchema): BevyJsonSchema {
  schema.readOnly = true;
  if (schema.properties) {
    schema.properties = Object.entries(schema.properties).reduce(
      (result: Record<string, BevyJsonSchema>, [key, subSchema]) => {
        result[key] = setReadOnly(subSchema);
        return result;
      },
      {},
    );
  }
  return schema;
}

function numberSchema(): BevyJsonSchema {
  return {
    type: 'number',
    shortPath: 'f32',
    typePath: 'f32',
  };
}

function globalTransform(typePath: string): BevyJsonSchemaDefinition {
  return {
    shortPath: 'GlobalTransform',
    typePath,
    type: 'object',
    required: ['matrix3', 'translation'],
    properties: {
      matrix3: {
        type: 'object',
        required: ['x_axis', 'y_axis', 'z_axis'],
        properties: {
          x_axis: {
            type: 'object',
            required: ['x', 'y', 'z'],
            properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
            shortPath: 'Vec3A',
            typePath: 'glam::Vec3A',
          },
          y_axis: {
            type: 'object',
            required: ['x', 'y', 'z'],
            properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
            shortPath: 'Vec3A',
            typePath: 'glam::Vec3A',
          },
          z_axis: {
            type: 'object',
            required: ['x', 'y', 'z'],
            properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
            shortPath: 'Vec3A',
            typePath: 'glam::Vec3A',
          },
        },
        shortPath: 'Mat3A',
        typePath: 'glam::Mat3A',
      },
      translation: {
        type: 'object',
        required: ['x', 'y', 'z'],
        properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
        shortPath: 'Vec3A',
        typePath: 'glam::Vec3A',
      },
    },
  };
}
