/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as brp15 from '../../brp/brp-0.15';
import type * as brp18 from '../../brp/brp-0.18';
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

  public parentIdFromParentComponent(value: unknown): brp18.EntityId | undefined {
    type ParentComponent = brp15.EntityId;
    return value as ParentComponent | undefined;
  }

  public async get(params: brp18.GetStrictParams): Promise<brp18.GetStrictResult>;
  public async get(params: brp18.GetLenientParams): Promise<brp18.GetLenientResult>;
  public async get(params: brp18.GetParams): Promise<brp18.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.get(params satisfies brp15.GetStrictParams);
    } else {
      return await this.remoteService.get(params satisfies brp15.GetLenientParams);
    }
  }

  public async query(params: brp18.QueryParams): Promise<brp18.QueryResult> {
    return await this.remoteService.query(params);
  }

  public async spawn(params: brp18.SpawnParams): Promise<brp18.SpawnResult> {
    return await this.remoteService.spawn(params);
  }

  public async insert(params: brp18.InsertParams): Promise<brp18.InsertResult> {
    return await this.remoteService.insert(params);
  }

  public async remove(params: brp18.RemoveParams): Promise<brp18.RemoveResult> {
    return await this.remoteService.remove(params);
  }

  public async destroy(params: brp18.DestroyParams): Promise<brp18.DestroyResult> {
    return await this.remoteService.destroy(params);
  }

  public async reparent(params: brp18.ReparentParams): Promise<brp18.ReparentResult> {
    return await this.remoteService.reparent(params);
  }

  public async list(params?: brp18.ListParams): Promise<brp18.ListResult> {
    return await this.remoteService.list(params);
  }

  public async mutateComponent(params: brp18.MutateComponentParams): Promise<brp18.MutateComponentResult> {
    throw new Error("Bevy 0.15.x doesn't support component mutation");
  }

  public async getWatch(params: brp18.GetWatchParams): Promise<brp18.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async listWatch(params: brp18.ListWatchParams): Promise<brp18.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResource(params: brp18.GetResourceParams): Promise<brp18.GetResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource retrieval");
  }

  public async insertResource(params: brp18.InsertResourceParams): Promise<brp18.InsertResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource insertion");
  }

  public async removeResource(params: brp18.RemoveResourceParams): Promise<brp18.RemoveResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource removal");
  }

  public async mutateResource(params: brp18.MutateResourceParams): Promise<brp18.MutateResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource mutation");
  }

  public async listResources(params: brp18.ListResourcesParams): Promise<brp18.ListResourcesResult> {
    throw new Error("Bevy 0.15.x doesn't support resource listing");
  }

  public async registrySchema(params?: brp18.RegistrySchemaParams): Promise<brp18.RegistrySchemaResult> {
    throw new Error("Bevy 0.15.x doesn't support registry schema");
  }

  public async discover(params: brp18.RpcDiscoverParams): Promise<brp18.RpcDiscoverResult> {
    throw new Error("Bevy 0.15.x doesn't support JSON RPC discovery");
  }
}
