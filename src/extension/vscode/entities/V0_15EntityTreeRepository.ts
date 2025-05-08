import type { BevyRemoteService, DestroyParams, QueryParams, ReparentParams, SpawnParams } from '../../../brp/brp-0.15';
import type { EntityNode, EntityTreeRepository } from './entityTree';
import { getEntitiesTree } from './entityTreeRepositories';

export class V0_15EntityTreeRepository implements EntityTreeRepository {
  brp: BevyRemoteService;

  constructor(brp: BevyRemoteService) {
    this.brp = brp;
  }

  async tree(): Promise<EntityNode[]> {
    return getEntitiesTree<BevyRemoteService, QueryParams>(
      this.brp,
      'bevy_core::name::Name',
      'bevy_hierarchy::components::children::Children',
    );
  }

  async spawn(): Promise<EntityNode> {
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

  async destroy(entity: EntityNode): Promise<void> {
    const params: DestroyParams = {
      entity: entity.id,
    };
    await this.brp.destroy(params);
  }

  async reparent(entity: EntityNode, parent: EntityNode | undefined): Promise<void> {
    const params: ReparentParams = {
      entities: [entity.id],
      parent: parent?.id,
    };
    await this.brp.reparent(params);
  }
}
