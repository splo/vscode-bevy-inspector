import type { TypedValue, TypePath } from '../../inspector-data/types';

export interface ResourceRepository {
  listResources(): Promise<TypedValue[]>;
  listTypePaths(): Promise<TypePath[]>;
  setResourceValue(typePath: string, path: string, value: unknown): Promise<void>;
  insertResource(typePath: string, value: unknown): Promise<void>;
}
