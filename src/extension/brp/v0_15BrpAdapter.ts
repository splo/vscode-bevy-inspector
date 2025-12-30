/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as brp15 from '../../brp/brp-0.15';
import type * as brp17 from '../../brp/brp-0.17';
import type { BrpAdapter } from './adapter';

export class V0_15BrpAdapter implements BrpAdapter {
  private remoteService: brp15.BevyRemoteService;

  public constructor(remoteService: brp15.BevyRemoteService) {
    this.remoteService = remoteService;
  }

  public readonly bevyVersion = '0.15';
  public readonly supportsResources = false;
  public readonly supportsRegistry = false;
  public readonly nameTypePath = 'bevy_core::name::Name';
  public readonly parentTypePath = 'bevy_hierarchy::components::parent::Parent';

  public nameFromNameComponent(value: unknown): string | undefined {
    interface NameComponent {
      hash: number;
      name: string;
    }
    return (value as NameComponent | undefined)?.name;
  }

  public parentIdFromParentComponent(value: unknown): brp17.EntityId | undefined {
    type ParentComponent = brp15.EntityId;
    return value as ParentComponent | undefined;
  }

  public async get(params: brp17.GetStrictParams): Promise<brp17.GetStrictResult>;
  public async get(params: brp17.GetLenientParams): Promise<brp17.GetLenientResult>;
  public async get(params: brp17.GetParams): Promise<brp17.GetResult> {
    return await this.remoteService.get({
      entity: params.entity,
      components: params.components,
      strict: params.strict ? undefined : false,
    } satisfies brp15.GetParams);
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
    throw new Error("Bevy 0.15.x doesn't support component mutation");
  }

  public async getWatch(params: brp17.GetWatchParams): Promise<brp17.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async listWatch(params: brp17.ListWatchParams): Promise<brp17.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResource(params: brp17.GetResourceParams): Promise<brp17.GetResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource retrieval");
  }

  public async insertResource(params: brp17.InsertResourceParams): Promise<brp17.InsertResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource insertion");
  }

  public async removeResource(params: brp17.RemoveResourceParams): Promise<brp17.RemoveResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource removal");
  }

  public async mutateResource(params: brp17.MutateResourceParams): Promise<brp17.MutateResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource mutation");
  }

  public async listResources(params: brp17.ListResourcesParams): Promise<brp17.ListResourcesResult> {
    throw new Error("Bevy 0.15.x doesn't support resource listing");
  }

  public async registrySchema(params?: brp17.RegistrySchemaParams): Promise<brp17.RegistrySchemaResult> {
    throw new Error("Bevy 0.15.x doesn't support registry schema");
  }

  public async discover(params: brp17.RpcDiscoverParams): Promise<brp17.RpcDiscoverResult> {
    throw new Error("Bevy 0.15.x doesn't support JSON RPC discovery");
  }
}
