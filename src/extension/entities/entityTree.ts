import type { EntityId, TypePath } from '../../inspector-data/types';

/** Represents a node in the entity tree structure. */
export interface EntityNode {
  id: EntityId;
  name?: string;
  componentNames: TypePath[];
  children: EntityNode[];
}

export function isEntityNode(node: unknown): node is EntityNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'id' in node &&
    'name' in node &&
    'componentNames' in node &&
    'children' in node
  );
}
