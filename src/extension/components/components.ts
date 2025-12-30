import type { EntityId, TypePath } from '../../inspector-data/types';

export interface EntityUpdated {
  entityId: EntityId;
  typePath: TypePath;
  path: string;
  newValue: unknown;
}
