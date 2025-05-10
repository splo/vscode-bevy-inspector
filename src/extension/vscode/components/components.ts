import type { EntityId, TypePath } from '../../../brp/types';
import type { TypedValue } from '../../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';

export interface EntityUpdated {
  entityId: EntityId;
  typePath: TypePath;
  path: string;
  newValue: unknown;
}

export interface ComponentRepository {
  listEntityComponents(entity: EntityNode): Promise<TypedValue[]>;
  setComponentValue(entityId: EntityId, typePath: TypePath, path: string, value: unknown): Promise<void>;
}
