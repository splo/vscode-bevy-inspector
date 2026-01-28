import type * as brp16 from '../../brp/brp-0.16';
import type * as brp18 from '../../brp/brp-0.18';
import type { BrpAdapter } from './adapter';

export class V0_16BrpAdapter implements BrpAdapter {
  private remoteService: brp16.BevyRemoteService;

  public constructor(remoteService: brp16.BevyRemoteService) {
    this.remoteService = remoteService;
  }

  public readonly bevyVersion = '0.16';
  public readonly supportsResources = true;
  public readonly supportsRegistry = true;
  public readonly nameTypePath = 'bevy_ecs::name::Name';
  public readonly parentTypePath = 'bevy_ecs::hierarchy::ChildOf';

  public nameFromNameComponent(value: unknown): string | undefined {
    type NameComponent = string;
    return value as NameComponent | undefined;
  }

  public parentIdFromParentComponent(value: unknown): brp18.EntityId | undefined {
    type ChildOfComponent = brp16.EntityId;
    return value as ChildOfComponent | undefined;
  }

  public async getComponents(params: brp18.GetStrictParams): Promise<brp18.GetStrictResult>;
  public async getComponents(params: brp18.GetLenientParams): Promise<brp18.GetLenientResult>;
  public async getComponents(params: brp18.GetParams): Promise<brp18.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.get(params satisfies brp16.GetStrictParams);
    } else {
      return await this.remoteService.get(params satisfies brp16.GetLenientParams);
    }
  }

  public async query(params: brp18.QueryParams): Promise<brp18.QueryResult> {
    return await this.remoteService.query(params);
  }

  public async spawnEntity(params: brp18.SpawnParams): Promise<brp18.SpawnResult> {
    return await this.remoteService.spawn(params);
  }

  public async insertComponents(params: brp18.InsertParams): Promise<brp18.InsertResult> {
    return await this.remoteService.insert(params);
  }

  public async removeComponents(params: brp18.RemoveParams): Promise<brp18.RemoveResult> {
    return await this.remoteService.remove(params);
  }

  public async despawnEntity(params: brp18.DestroyParams): Promise<brp18.DestroyResult> {
    return await this.remoteService.destroy(params);
  }

  public async reparentEntities(params: brp18.ReparentParams): Promise<brp18.ReparentResult> {
    return await this.remoteService.reparent(params);
  }

  public async listComponents(params?: brp18.ListParams): Promise<brp18.ListResult> {
    return await this.remoteService.list(params);
  }

  public async mutateComponents(params: brp18.MutateComponentParams): Promise<brp18.MutateComponentResult> {
    return await this.remoteService.mutateComponent(params);
  }

  public async watchGetComponents(params: brp18.GetWatchParams): Promise<brp18.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async watchListComponents(params: brp18.ListWatchParams): Promise<brp18.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResources(params: brp18.GetResourceParams): Promise<brp18.GetResourceResult> {
    return await this.remoteService.getResource(params);
  }

  public async insertResources(params: brp18.InsertResourceParams): Promise<brp18.InsertResourceResult> {
    return await this.remoteService.insertResource(params);
  }

  public async removeResources(params: brp18.RemoveResourceParams): Promise<brp18.RemoveResourceResult> {
    return await this.remoteService.removeResource(params);
  }

  public async mutateResources(params: brp18.MutateResourceParams): Promise<brp18.MutateResourceResult> {
    return await this.remoteService.mutateResource(params);
  }

  public async listResources(params: brp18.ListResourcesParams): Promise<brp18.ListResourcesResult> {
    return await this.remoteService.listResources(params);
  }

  public async registrySchema(params?: brp18.RegistrySchemaParams): Promise<brp18.RegistrySchemaResult> {
    return await this.remoteService.registrySchema(params);
  }

  public async discover(params: brp18.RpcDiscoverParams): Promise<brp18.RpcDiscoverResult> {
    return await this.remoteService.discover(params);
  }
}
