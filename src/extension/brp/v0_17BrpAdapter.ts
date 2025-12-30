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

  public async get(params: brplatest.GetStrictParams): Promise<brplatest.GetStrictResult>;
  public async get(params: brplatest.GetLenientParams): Promise<brplatest.GetLenientResult>;
  public async get(params: brplatest.GetParams): Promise<brplatest.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.get(params satisfies brp17.GetStrictParams);
    } else {
      return await this.remoteService.get(params satisfies brp17.GetLenientParams);
    }
  }

  public async query(params: brplatest.QueryParams): Promise<brplatest.QueryResult> {
    return await this.remoteService.query(params);
  }

  public async spawn(params: brplatest.SpawnParams): Promise<brplatest.SpawnResult> {
    return await this.remoteService.spawn(params);
  }

  public async insert(params: brplatest.InsertParams): Promise<brplatest.InsertResult> {
    return await this.remoteService.insert(params);
  }

  public async remove(params: brplatest.RemoveParams): Promise<brplatest.RemoveResult> {
    return await this.remoteService.remove(params);
  }

  public async destroy(params: brplatest.DestroyParams): Promise<brplatest.DestroyResult> {
    return await this.remoteService.destroy(params);
  }

  public async reparent(params: brplatest.ReparentParams): Promise<brplatest.ReparentResult> {
    return await this.remoteService.reparent(params);
  }

  public async list(params?: brp17.ListParams): Promise<brplatest.ListResult> {
    return await this.remoteService.list(params);
  }

  public async mutateComponent(params: brplatest.MutateComponentParams): Promise<brplatest.MutateComponentResult> {
    return await this.remoteService.mutateComponent(params);
  }

  public async getWatch(params: brplatest.GetWatchParams): Promise<brplatest.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async listWatch(params: brplatest.ListWatchParams): Promise<brplatest.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResource(params: brplatest.GetResourceParams): Promise<brplatest.GetResourceResult> {
    return await this.remoteService.getResource(params);
  }

  public async insertResource(params: brplatest.InsertResourceParams): Promise<brplatest.InsertResourceResult> {
    return await this.remoteService.insertResource(params);
  }

  public async removeResource(params: brplatest.RemoveResourceParams): Promise<brplatest.RemoveResourceResult> {
    return await this.remoteService.removeResource(params);
  }

  public async mutateResource(params: brplatest.MutateResourceParams): Promise<brplatest.MutateResourceResult> {
    return await this.remoteService.mutateResource(params);
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
