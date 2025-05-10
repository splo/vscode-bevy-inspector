import type { Schema } from 'genson-js';
import { createSchema } from 'genson-js';
import type { BevyJsonSchema, BevyJsonSchemaDefinition, TypePath } from '../../inspector-data/types';
import { shortenTypePath } from './schemas';

export class ReflectionSchemaService {
  public createTypeSchema(typePath: TypePath, value: unknown): Promise<BevyJsonSchemaDefinition> {
    const schema = createSchema(value);
    const jsonSchema = this.toJsonSchema(schema, typePath);
    return Promise.resolve(jsonSchema);
  }

  private toJsonSchema(schema: Schema, typePath: TypePath): BevyJsonSchemaDefinition {
    if (typePath === 'bevy_transform::components::global_transform::GlobalTransform') {
      return globalTransform(typePath);
    }
    return {
      typePath,
      shortPath: shortenTypePath(typePath),
      ...setReadOnly(fixJsonSchema(schema)),
    };
  }
}

function fixJsonSchema(schema: Schema): BevyJsonSchema {
  if (schema === null || typeof schema !== 'object') {
    return schema;
  }
  const result = Array.isArray(schema) ? [] : {};
  for (const key in schema) {
    if (!Object.prototype.hasOwnProperty.call(schema, key)) {
      continue;
    }
    const value = (schema as Record<string, unknown>)[key];
    // Convert 'integer' to 'number'.
    if (key === 'type' && value === 'integer') {
      (result as Record<string, unknown>)[key] = 'number';
    } else if (key === 'properties' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const props = value as Record<string, Schema>;
      const propsResult: Record<string, unknown> = {};
      for (const prop in props) {
        if (Object.prototype.hasOwnProperty.call(props, prop)) {
          propsResult[prop] = fixJsonSchema(props[prop]);
        }
      }
      (result as Record<string, unknown>)[key] = propsResult;
    } else if (key === 'items' && value) {
      (result as Record<string, unknown>)[key] = fixJsonSchema(value as Schema);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) => fixJsonSchema(item as Schema));
    } else if (typeof value === 'object' && value !== null) {
      (result as Record<string, unknown>)[key] = fixJsonSchema(value as Schema);
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result as BevyJsonSchema;
}

export function setReadOnly(schema: BevyJsonSchema): BevyJsonSchema {
  if (schema === null || typeof schema !== 'object') {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map((item) => setReadOnly(item)) as BevyJsonSchema;
  }
  const result: Record<string, unknown> = { ...schema, readOnly: true };
  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      continue;
    }
    const value = result[key];
    if (key === 'properties' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively set readOnly: true on all property schemas.
      const props = value as Record<string, unknown>;
      const newProps: Record<string, unknown> = {};
      for (const prop in props) {
        if (Object.prototype.hasOwnProperty.call(props, prop)) {
          newProps[prop] = setReadOnly(props[prop] as BevyJsonSchema);
        }
      }
      result[key] = newProps;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = setReadOnly(value as BevyJsonSchema);
    }
  }
  return result as BevyJsonSchema;
}

function numberSchema(): BevyJsonSchema {
  return {
    readOnly: true,
    type: 'number',
    shortPath: 'f32',
    typePath: 'f32',
  };
}

function globalTransform(typePath: string): BevyJsonSchemaDefinition {
  return {
    readOnly: true,
    shortPath: 'GlobalTransform',
    typePath,
    type: 'object',
    required: ['matrix3', 'translation'],
    properties: {
      matrix3: {
        readOnly: true,
        type: 'object',
        required: ['x_axis', 'y_axis', 'z_axis'],
        properties: {
          x_axis: {
            readOnly: true,
            type: 'object',
            required: ['x', 'y', 'z'],
            properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
            shortPath: 'Vec3A',
            typePath: 'glam::Vec3A',
          },
          y_axis: {
            readOnly: true,
            type: 'object',
            required: ['x', 'y', 'z'],
            properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
            shortPath: 'Vec3A',
            typePath: 'glam::Vec3A',
          },
          z_axis: {
            readOnly: true,
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
        readOnly: true,
        type: 'object',
        required: ['x', 'y', 'z'],
        properties: { x: numberSchema(), y: numberSchema(), z: numberSchema() },
        shortPath: 'Vec3A',
        typePath: 'glam::Vec3A',
      },
    },
  };
}
