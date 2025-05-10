import type { TypedValue } from '../../../inspector-data/types';

export interface ResourceRepository {
  listResources(): Promise<TypedValue[]>;
  setResourceValue(typePath: string, path: string, value: unknown): Promise<void>;
}
