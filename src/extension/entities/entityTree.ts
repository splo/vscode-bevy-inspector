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

/** Repository interface for managing a tree of entities. */
export interface EntityTreeRepository {
  /** Lists all entities in the repository as a tree structure. */
  tree(): Promise<EntityNode[]>;
  /** Spawns a new entity in the repository. */
  spawn(): Promise<EntityNode>;
  /** Destroys the specified entity in the repository. */
  destroy(entity: EntityNode): Promise<void>;
  /** Reparents the specified entity under a new parent in the repository. */
  reparent(entity: EntityNode, parent: EntityNode | undefined): Promise<void>;
  /** Checks if the specified type path is a name type. */
  isNameType(typePath: string): boolean;
}
