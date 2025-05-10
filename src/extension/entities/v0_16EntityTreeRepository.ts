import type {
  BevyRemoteService,
  DestroyParams,
  EntityId,
  QueryParams,
  ReparentParams,
  SpawnParams,
} from '../../brp/brp-0.16';
import type { EntityNode, EntityTreeRepository } from './entityTree';
import { getEntitiesTree } from './entityTreeRepositories';

type NameComponent = string;
type ChildOfComponent = EntityId;

export class V0_16EntityTreeRepository implements EntityTreeRepository {
  brp: BevyRemoteService;

  constructor(brp: BevyRemoteService) {
    this.brp = brp;
  }

  async tree(): Promise<EntityNode[]> {
    return getEntitiesTree<BevyRemoteService, QueryParams>(
      this.brp,
      'bevy_ecs::name::Name',
      'bevy_ecs::hierarchy::ChildOf',
      (value) => value as NameComponent | undefined,
      (value) => value as ChildOfComponent | undefined,
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

  isNameType(typePath: string): boolean {
    return typePath === 'bevy_ecs::name::Name';
  }
}
