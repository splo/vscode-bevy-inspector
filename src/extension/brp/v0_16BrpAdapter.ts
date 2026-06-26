import type * as brp16 from '../../brp/brp-0.16';
import type * as brplatest from '../../brp/brp-0.19';
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

  public parentIdFromParentComponent(value: unknown): brplatest.EntityId | undefined {
    type ChildOfComponent = brp16.EntityId;
    return value as ChildOfComponent | undefined;
  }

  public async getComponents(params: brplatest.GetStrictParams): Promise<brplatest.GetStrictResult>;
  public async getComponents(params: brplatest.GetLenientParams): Promise<brplatest.GetLenientResult>;
  public async getComponents(params: brplatest.GetParams): Promise<brplatest.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.get(params satisfies brp16.GetStrictParams);
    } else {
      return await this.remoteService.get(params satisfies brp16.GetLenientParams);
    }
  }

  public async query(params: brplatest.QueryParams): Promise<brplatest.QueryResult> {
    return await this.remoteService.query(params);
  }

  public async spawnEntity(params: brplatest.SpawnParams): Promise<brplatest.SpawnResult> {
    return await this.remoteService.spawn(params);
  }

  public async insertComponents(params: brplatest.InsertParams): Promise<brplatest.InsertResult> {
    return await this.remoteService.insert(params);
  }

  public async removeComponents(params: brplatest.RemoveParams): Promise<brplatest.RemoveResult> {
    return await this.remoteService.remove(params);
  }

  public async despawnEntity(params: brplatest.DestroyParams): Promise<brplatest.DestroyResult> {
    return await this.remoteService.destroy(params);
  }

  public async reparentEntities(params: brplatest.ReparentParams): Promise<brplatest.ReparentResult> {
    return await this.remoteService.reparent(params);
  }

  public async listComponents(params?: brplatest.ListParams): Promise<brplatest.ListResult> {
    return await this.remoteService.list(params);
  }

  public async mutateComponents(params: brplatest.MutateComponentParams): Promise<brplatest.MutateComponentResult> {
    return await this.remoteService.mutateComponent(params);
  }

  public async watchGetComponents(params: brplatest.GetWatchParams): Promise<brplatest.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async watchListComponents(params: brplatest.ListWatchParams): Promise<brplatest.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResources(params: brplatest.GetResourceParams): Promise<brplatest.GetResourceResult> {
    return await this.remoteService.getResource(params);
  }

  public async insertResources(params: brplatest.InsertResourceParams): Promise<brplatest.InsertResourceResult> {
    return await this.remoteService.insertResource(params);
  }

  public async removeResources(params: brplatest.RemoveResourceParams): Promise<brplatest.RemoveResourceResult> {
    return await this.remoteService.removeResource(params);
  }

  public async mutateResources(params: brplatest.MutateResourceParams): Promise<brplatest.MutateResourceResult> {
    return await this.remoteService.mutateResource(params);
  }

  public async listResources(params: brplatest.ListResourcesParams): Promise<brplatest.ListResourcesResult> {
    return await this.remoteService.listResources(params);
  }

  public async triggerEvent(params: brplatest.TriggerEventParams): Promise<brplatest.TriggerEventResult> {
    throw new Error("Bevy 0.16.x doesn't support event triggering");
  }

  public async registrySchema(params?: brplatest.RegistrySchemaParams): Promise<brplatest.RegistrySchemaResult> {
    return await this.remoteService.registrySchema(params);
  }

  public async discover(params: brplatest.RpcDiscoverParams): Promise<brplatest.RpcDiscoverResult> {
    return await this.remoteService.discover(params);
  }
}
