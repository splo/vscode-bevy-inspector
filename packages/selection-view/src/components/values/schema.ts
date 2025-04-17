import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Mat3 {
  x_axis: Vec3;
  y_axis: Vec3;
  z_axis: Vec3;
}

export function buildPath(path: string, name: string | undefined): string {
  const namePath = name ?? '';
  if (path.length > 0) {
    return `${path}.${namePath}`;
  }
  return namePath;
}

export function generateDefault(schema: BevyJsonSchema): unknown {
  if (schema.const !== undefined) {
    return schema.const;
  }
  switch (schema?.type) {
    case undefined:
      return null;
    case 'null':
      return null;
    case 'boolean':
      return false;
    case 'number':
      return 0;
    case 'string':
      return '';
    case 'array': {
      if (Array.isArray(schema.items)) {
        return schema.items.map((itemSchema) => generateDefault(itemSchema));
      } else if (schema.items) {
        const length = schema.minItems || 0;
        return Array.from({ length }, () => generateDefault(schema.items as BevyJsonSchema));
      }
      return [];
    }
    case 'object':
      return Object.fromEntries(
        Object.entries(schema.properties || {}).map(([key, value]) => [key, generateDefault(value)]),
      );
  }
  return null;
}

export function adheresToSchema(value: unknown, schema: BevyJsonSchema): boolean {
  if (schema.const !== undefined) {
    return value === schema.const;
  }
  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const obj = value as Record<string, unknown>;
    for (const [key, subSchema] of Object.entries(schema.properties || {})) {
      if (!adheresToSchema(obj[key], subSchema)) {
        return false;
      }
    }
    return true;
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value) || !Array.isArray(schema.items)) {
      return false;
    }
    value.forEach((item, index) => {
      const itemSchema = (schema.items as BevyJsonSchema[])[index];
      if (!itemSchema || !adheresToSchema(item, itemSchema)) {
        return false;
      }
    });
    return true;
  }
  if (schema.type === 'string') {
    return typeof value === 'string';
  }
  if (schema.type === 'number') {
    return typeof value === 'number';
  }
  return false;
}
