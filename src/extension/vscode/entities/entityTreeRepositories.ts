import type {
  BevyRemoteService as V0_15BevyRemoteService,
  QueryParams as V0_15QueryParams,
} from '../../../brp/brp-0.15';
import type {
  BevyRemoteService as V0_16BevyRemoteService,
  QueryParams as V0_16QueryParams,
} from '../../../brp/brp-0.16';
import type { EntityId, TypePath } from '../../../brp/types';
import type { EntityNode } from './entityTree';

export async function getEntitiesTree<
  RemoteService extends V0_15BevyRemoteService | V0_16BevyRemoteService,
  QueryParams extends V0_15QueryParams | V0_16QueryParams,
>(brp: RemoteService, nameTypePath: TypePath, parentTypePath: TypePath): Promise<EntityNode[]> {
  const queryParams = {
    data: { option: [nameTypePath, parentTypePath] },
  } as QueryParams;
  const queryResult = await brp.query(queryParams);

  const entityById = new Map<EntityId, EntityNode>();
  const parentById = new Map<EntityId, EntityId>();

  await Promise.all(
    queryResult.map(async (row) => {
      const componentNames = await brp.list({ entity: row.entity });
      const name = row.components[nameTypePath] as string;
      const parentId = row.components[parentTypePath] as EntityId | undefined;
      entityById.set(row.entity, {
        id: row.entity,
        name,
        componentNames,
        children: [],
      });
      if (parentId !== undefined) {
        parentById.set(row.entity, parentId);
      }
    }),
  );

  // Build parent-child relationships.
  entityById.forEach((node, id) => {
    const parentId = parentById.get(id);
    if (parentId !== undefined) {
      // Parents are supposed to be present in the query result.
      entityById.get(parentId)?.children.push(node);
    }
  });

  // Collect top-level nodes.
  return Array.from(entityById.values()).filter((node) => !parentById.has(node.id));
}
