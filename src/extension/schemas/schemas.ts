import type { BevyJsonSchemaDefinition, TypePath } from '../../inspector-data/types';

export function shortenTypePath(typePath: TypePath): string {
  return typePath.replaceAll(/\w*::/g, '');
}

export interface SchemaService {
  getTypeSchema(typePath: TypePath, value?: unknown): Promise<BevyJsonSchemaDefinition>;
}
