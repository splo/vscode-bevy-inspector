import type * as brp16 from '../../brp/brp-0.16';
import type * as brp17 from '../../brp/brp-0.17';
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

  public parentIdFromParentComponent(value: unknown): brp17.EntityId | undefined {
    type ChildOfComponent = brp16.EntityId;
    return value as ChildOfComponent | undefined;
  }

  public async get(params: brp17.GetStrictParams): Promise<brp17.GetStrictResult>;
  public async get(params: brp17.GetLenientParams): Promise<brp17.GetLenientResult>;
  public async get(params: brp17.GetParams): Promise<brp17.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.get({
        entity: params.entity,
        components: params.components,
        strict: true,
      } satisfies brp16.GetStrictParams);
    } else {
      return await this.remoteService.get({
        entity: params.entity,
        components: params.components,
        strict: params.strict,
      } satisfies brp16.GetLenientParams);
    }
  }

  public async query(params: brp17.QueryParams): Promise<brp17.QueryResult> {
    return await this.remoteService.query(params);
  }

  public async spawn(params: brp17.SpawnParams): Promise<brp17.SpawnResult> {
    return await this.remoteService.spawn(params);
  }

  public async insert(params: brp17.InsertParams): Promise<brp17.InsertResult> {
    return await this.remoteService.insert(params);
  }

  public async remove(params: brp17.RemoveParams): Promise<brp17.RemoveResult> {
    return await this.remoteService.remove(params);
  }

  public async destroy(params: brp17.DestroyParams): Promise<brp17.DestroyResult> {
    return await this.remoteService.destroy(params);
  }

  public async reparent(params: brp17.ReparentParams): Promise<brp17.ReparentResult> {
    return await this.remoteService.reparent(params);
  }

  public async list(params?: brp17.ListParams): Promise<brp17.ListResult> {
    return await this.remoteService.list(params);
  }

  public async mutateComponent(params: brp17.MutateComponentParams): Promise<brp17.MutateComponentResult> {
    return await this.remoteService.mutateComponent(params);
  }

  public async getWatch(params: brp17.GetWatchParams): Promise<brp17.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async listWatch(params: brp17.ListWatchParams): Promise<brp17.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResource(params: brp17.GetResourceParams): Promise<brp17.GetResourceResult> {
    return await this.remoteService.getResource(params);
  }

  public async insertResource(params: brp17.InsertResourceParams): Promise<brp17.InsertResourceResult> {
    return await this.remoteService.insertResource(params);
  }

  public async removeResource(params: brp17.RemoveResourceParams): Promise<brp17.RemoveResourceResult> {
    return await this.remoteService.removeResource(params);
  }

  public async mutateResource(params: brp17.MutateResourceParams): Promise<brp17.MutateResourceResult> {
    return await this.remoteService.mutateResource(params);
  }

  public async listResources(params: brp17.ListResourcesParams): Promise<brp17.ListResourcesResult> {
    return await this.remoteService.listResources(params);
  }

  public async registrySchema(params?: brp17.RegistrySchemaParams): Promise<brp17.RegistrySchemaResult> {
    return await this.remoteService.registrySchema(params);
  }

  public async discover(params: brp17.RpcDiscoverParams): Promise<brp17.RpcDiscoverResult> {
    return await this.remoteService.discover(params);
  }
}
