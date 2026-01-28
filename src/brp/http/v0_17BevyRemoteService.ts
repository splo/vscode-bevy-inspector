import type * as brp from '../brp-0.17';
import { JsonRpcClient } from './jsonRpcClient';

export class V0_17BevyRemoteService extends JsonRpcClient implements brp.BevyRemoteService {
  public constructor(url: string, logger: (message: string, ...args: unknown[]) => void) {
    super(url, logger);
  }

  public async getComponents(params: brp.GetStrictParams): Promise<brp.GetStrictResult>;
  public async getComponents(params: brp.GetLenientParams): Promise<brp.GetLenientResult>;
  public async getComponents(params: brp.GetParams): Promise<brp.GetResult> {
    return await this.doRequest(params, 'world.get_components');
  }

  public async query(params: brp.QueryParams): Promise<brp.QueryResult> {
    return await this.doRequest(params, 'world.query');
  }

  public async spawnEntity(params: brp.SpawnParams): Promise<brp.SpawnResult> {
    return await this.doRequest(params, 'world.spawn_entity');
  }

  public async despawnEntity(params: brp.DestroyParams): Promise<brp.DestroyResult> {
    return await this.doRequest(params, 'world.despawn_entity');
  }

  public async removeComponents(params: brp.RemoveParams): Promise<brp.RemoveResult> {
    return await this.doRequest(params, 'world.remove_components');
  }

  public async insertComponents(params: brp.InsertParams): Promise<brp.InsertResult> {
    return await this.doRequest(params, 'world.insert_components');
  }

  public async reparentEntities(params: brp.ReparentParams): Promise<brp.ReparentResult> {
    return await this.doRequest(params, 'world.reparent_entities');
  }

  public async listComponents(params?: brp.ListParams): Promise<brp.ListResult> {
    return await this.doRequest(params, 'world.list_components');
  }

  public async mutateComponents(params: brp.MutateComponentParams): Promise<brp.MutateComponentResult> {
    return await this.doRequest(params, 'world.mutate_components');
  }

  public async watchGetComponents(params: brp.GetWatchParams): Promise<brp.GetWatchResult> {
    return await this.doRequest(params, 'world.get_components+watch');
  }

  public async watchListComponents(params: brp.ListWatchParams): Promise<brp.ListWatchResult> {
    return await this.doRequest(params, 'world.list_components+watch');
  }

  public async getResources(params: brp.GetResourceParams): Promise<brp.GetResourceResult> {
    return await this.doRequest(params, 'world.get_resources');
  }

  public async insertResources(params: brp.InsertResourceParams): Promise<brp.InsertResourceResult> {
    return await this.doRequest(params, 'world.insert_resources');
  }

  public async removeResources(params: brp.RemoveResourceParams): Promise<brp.RemoveResourceResult> {
    return await this.doRequest(params, 'world.remove_resources');
  }

  public async mutateResources(params: brp.MutateResourceParams): Promise<brp.MutateResourceResult> {
    return await this.doRequest(params, 'world.mutate_resources');
  }

  public async listResources(params: brp.ListResourcesParams): Promise<brp.ListResourcesResult> {
    return await this.doRequest(params, 'world.list_resources');
  }

  public async registrySchema(params?: brp.RegistrySchemaParams): Promise<brp.RegistrySchemaResult> {
    return await this.doRequest(params, 'registry.schema');
  }

  public async discover(params: brp.RpcDiscoverParams): Promise<brp.RpcDiscoverResult> {
    return await this.doRequest(params, 'rpc.discover');
  }
}
