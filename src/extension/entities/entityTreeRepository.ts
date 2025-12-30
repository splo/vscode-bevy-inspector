import type { DestroyParams, EntityId, QueryParams, ReparentParams, SpawnParams } from '../../brp/brp-0.18';
import type { BrpAdapter } from '../brp/adapter';
import { logger } from '../vscode/logger';
import type { EntityNode } from './entityTree';

const ENTITY_NOT_FOUND_ERROR_CODE = -23401;

/** Class for managing a tree of entities. */
export class EntityTreeRepository {
  brp: BrpAdapter;

  constructor(brp: BrpAdapter) {
    this.brp = brp;
  }

  /** List all entities in the repository as a tree structure. */
  public async tree(): Promise<EntityNode[]> {
    const queryParams = {
      data: { option: [this.brp.nameTypePath, this.brp.parentTypePath] },
    } as QueryParams;
    const queryResult = await this.brp.query(queryParams);

    const entityById = new Map<EntityId, EntityNode>();
    const parentById = new Map<EntityId, EntityId>();

    await Promise.all(
      queryResult.map(async (row) => {
        try {
          const componentNames = await this.brp.list({ entity: row.entity });
          const name = this.brp.nameFromNameComponent(row.components[this.brp.nameTypePath]);
          const parentId = this.brp.parentIdFromParentComponent(row.components[this.brp.parentTypePath]);
          entityById.set(row.entity, {
            id: row.entity,
            name,
            componentNames,
            children: [],
          });
          if (parentId !== undefined) {
            parentById.set(row.entity, parentId);
          }
        } catch (error: unknown) {
          if (getErrorCode(error) === ENTITY_NOT_FOUND_ERROR_CODE) {
            // If listing components fails (e.g., entity despawned), skip this entity.
            // We intentionally do not add it to the tree and continue processing others.
            logger.warn(`Entity ${row.entity} not found when listing components, skipping`);
            return;
          } else {
            throw error;
          }
        }
      }),
    );

    // Build parent-child relationships.
    entityById.forEach((node, id) => {
      const parentId = parentById.get(id);
      if (parentId !== undefined) {
        const parent = entityById.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent is missing (possibly skipped). Treat this node as top-level.
          parentById.delete(id);
        }
      }
    });

    // Collect top-level nodes.
    return Array.from(entityById.values()).filter((node) => !parentById.has(node.id));
  }

  /** Spawn a new entity in the repository. */
  public async spawn(): Promise<EntityNode> {
    const params: SpawnParams = {
      components: {},
    };
    const result = await this.brp.spawn(params);
    return {
      id: result.entity,
      componentNames: [],
      children: [],
    };
  }

  /** Destroy the specified entity in the repository. */
  public async destroy(entity: EntityNode): Promise<void> {
    const params: DestroyParams = {
      entity: entity.id,
    };
    await this.brp.destroy(params);
  }

  /** Reparent the specified entity under a new parent in the repository. */
  public async reparent(entity: EntityNode, parent: EntityNode | undefined): Promise<void> {
    const params: ReparentParams = {
      entities: [entity.id],
      parent: parent?.id,
    };
    await this.brp.reparent(params);
  }

  /** Check if the specified type path is a name type. */
  public isNameType(typePath: string): boolean {
    return typePath === this.brp.nameTypePath;
  }
}

function getErrorCode(error: unknown): number | undefined {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number'
    ? error.code
    : undefined;
}
