/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as brp15 from '../../brp/brp-0.15';
import type * as brplatest from '../../brp/brp-0.18';
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

  public parentIdFromParentComponent(value: unknown): brplatest.EntityId | undefined {
    type ParentComponent = brp15.EntityId;
    return value as ParentComponent | undefined;
  }

  public async getComponents(params: brplatest.GetStrictParams): Promise<brplatest.GetStrictResult>;
  public async getComponents(params: brplatest.GetLenientParams): Promise<brplatest.GetLenientResult>;
  public async getComponents(params: brplatest.GetParams): Promise<brplatest.GetResult> {
    if (params.strict === true) {
      return await this.remoteService.get(params satisfies brp15.GetStrictParams);
    } else {
      return await this.remoteService.get(params satisfies brp15.GetLenientParams);
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
    throw new Error("Bevy 0.15.x doesn't support component mutation");
  }

  public async watchGetComponents(params: brplatest.GetWatchParams): Promise<brplatest.GetWatchResult> {
    return await this.remoteService.getWatch(params);
  }

  public async watchListComponents(params: brplatest.ListWatchParams): Promise<brplatest.ListWatchResult> {
    return await this.remoteService.listWatch(params);
  }

  public async getResources(params: brplatest.GetResourceParams): Promise<brplatest.GetResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource retrieval");
  }

  public async insertResources(params: brplatest.InsertResourceParams): Promise<brplatest.InsertResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource insertion");
  }

  public async removeResources(params: brplatest.RemoveResourceParams): Promise<brplatest.RemoveResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource removal");
  }

  public async mutateResources(params: brplatest.MutateResourceParams): Promise<brplatest.MutateResourceResult> {
    throw new Error("Bevy 0.15.x doesn't support resource mutation");
  }

  public async listResources(params: brplatest.ListResourcesParams): Promise<brplatest.ListResourcesResult> {
    throw new Error("Bevy 0.15.x doesn't support resource listing");
  }

  public async triggerEvent(params: brplatest.TriggerEventParams): Promise<brplatest.TriggerEventResult> {
    throw new Error("Bevy 0.15.x doesn't support event triggering");
  }

  public async registrySchema(params?: brplatest.RegistrySchemaParams): Promise<brplatest.RegistrySchemaResult> {
    throw new Error("Bevy 0.15.x doesn't support registry schema");
  }

  public async discover(params: brplatest.RpcDiscoverParams): Promise<brplatest.RpcDiscoverResult> {
    throw new Error("Bevy 0.15.x doesn't support JSON RPC discovery");
  }
}
