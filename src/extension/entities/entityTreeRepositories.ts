import type {
  EntityId,
  TypePath,
  BevyRemoteService as V0_15BevyRemoteService,
  QueryParams as V0_15QueryParams,
} from '../../brp/brp-0.15';
import type { BevyRemoteService as V0_16BevyRemoteService, QueryParams as V0_16QueryParams } from '../../brp/brp-0.16';
import type { BevyRemoteService as V0_17BevyRemoteService, QueryParams as V0_17QueryParams } from '../../brp/brp-0.17';
import type { EntityNode } from './entityTree';

export async function getEntitiesTree<
  RemoteService extends V0_15BevyRemoteService | V0_16BevyRemoteService | V0_17BevyRemoteService,
  QueryParams extends V0_15QueryParams | V0_16QueryParams | V0_17QueryParams,
>(
  brp: RemoteService,
  nameTypePath: TypePath,
  parentTypePath: TypePath,
  getName: (value: unknown) => string | undefined,
  getParentId: (value: unknown) => EntityId | undefined,
): Promise<EntityNode[]> {
  const queryParams = {
    data: { option: [nameTypePath, parentTypePath] },
  } as QueryParams;
  const queryResult = await brp.query(queryParams);

  const entityById = new Map<EntityId, EntityNode>();
  const parentById = new Map<EntityId, EntityId>();

  await Promise.all(
    queryResult.map(async (row) => {
      try {
        const componentNames = await brp.list({ entity: row.entity });
        const name = getName(row.components[nameTypePath]);
        const parentId = getParentId(row.components[parentTypePath]);
        entityById.set(row.entity, {
          id: row.entity,
          name,
          componentNames,
          children: [],
        });
        if (parentId !== undefined) {
          parentById.set(row.entity, parentId);
        }
      } catch {
        // If listing components fails (e.g., entity despawned), skip this entity.
        // We intentionally do not add it to the tree and continue processing others.
        return;
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
