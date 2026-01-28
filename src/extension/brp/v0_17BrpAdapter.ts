import type * as brp17 from '../../brp/brp-0.17';
import type * as brplatest from '../../brp/brp-0.18';
import type { BrpAdapter } from './adapter';

export class V0_17BrpAdapter implements BrpAdapter {
  private remoteService: brp17.BevyRemoteService;

  public constructor(remoteService: brp17.BevyRemoteService) {
    this.remoteService = remoteService;
  }

  public readonly bevyVersion = '0.17';
  public readonly supportsResources = true;
  public readonly supportsRegistry = true;
  public readonly nameTypePath = 'bevy_ecs::name::Name';
  public readonly parentTypePath = 'bevy_ecs::hierarchy::ChildOf';

  public nameFromNameComponent(value: unknown): string | undefined {
    type NameComponent = string;
    return value as NameComponent | undefined;
  }

  public parentIdFromParentComponent(value: unknown): brplatest.EntityId | undefined {
    type ChildOfComponent = brp17.EntityId;
    return value as ChildOfComponent | undefined;
  }

  public async getComponents(params: brplatest.GetStrictParams): Promise<brplatest.GetStrictResult>;
  public async getComponents(params: brplatest.GetLenientParams): Promise<brplatest.GetLenientResult>;
  public async getComponents(params: brplatest.GetParams): Promise<brplatest.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.getComponents(params satisfies brp17.GetStrictParams);
    } else {
      return await this.remoteService.getComponents(params satisfies brp17.GetLenientParams);
    }
  }

  public async query(params: brplatest.QueryParams): Promise<brplatest.QueryResult> {
    return await this.remoteService.query(params);
  }

  public async spawnEntity(params: brplatest.SpawnParams): Promise<brplatest.SpawnResult> {
    return await this.remoteService.spawnEntity(params);
  }

  public async insertComponents(params: brplatest.InsertParams): Promise<brplatest.InsertResult> {
    return await this.remoteService.insertComponents(params);
  }

  public async removeComponents(params: brplatest.RemoveParams): Promise<brplatest.RemoveResult> {
    return await this.remoteService.removeComponents(params);
  }

  public async despawnEntity(params: brplatest.DestroyParams): Promise<brplatest.DestroyResult> {
    return await this.remoteService.despawnEntity(params);
  }

  public async reparentEntities(params: brplatest.ReparentParams): Promise<brplatest.ReparentResult> {
    return await this.remoteService.reparentEntities(params);
  }

  public async listComponents(params?: brp17.ListParams): Promise<brplatest.ListResult> {
    return await this.remoteService.listComponents(params);
  }

  public async mutateComponents(params: brplatest.MutateComponentParams): Promise<brplatest.MutateComponentResult> {
    return await this.remoteService.mutateComponents(params);
  }

  public async watchGetComponents(params: brplatest.GetWatchParams): Promise<brplatest.GetWatchResult> {
    return await this.remoteService.watchGetComponents(params);
  }

  public async watchListComponents(params: brplatest.ListWatchParams): Promise<brplatest.ListWatchResult> {
    return await this.remoteService.watchListComponents(params);
  }

  public async getResources(params: brplatest.GetResourceParams): Promise<brplatest.GetResourceResult> {
    return await this.remoteService.getResources(params);
  }

  public async insertResources(params: brplatest.InsertResourceParams): Promise<brplatest.InsertResourceResult> {
    return await this.remoteService.insertResources(params);
  }

  public async removeResources(params: brplatest.RemoveResourceParams): Promise<brplatest.RemoveResourceResult> {
    return await this.remoteService.removeResources(params);
  }

  public async mutateResources(params: brplatest.MutateResourceParams): Promise<brplatest.MutateResourceResult> {
    return await this.remoteService.mutateResources(params);
  }

  public async listResources(params: brplatest.ListResourcesParams): Promise<brplatest.ListResourcesResult> {
    return await this.remoteService.listResources(params);
  }

  public async registrySchema(params?: brp17.RegistrySchemaParams): Promise<brplatest.RegistrySchemaResult> {
    return await this.remoteService.registrySchema(params);
  }

  public async discover(params: brplatest.RpcDiscoverParams): Promise<brplatest.RpcDiscoverResult> {
    return await this.remoteService.discover(params);
  }
}
