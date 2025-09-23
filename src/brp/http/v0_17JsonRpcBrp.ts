import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-types';
import { isJsonRpcSuccess } from 'json-rpc-types';
import type * as brp from '../../brp/brp-0.17';

export class V0_17BevyRemoteService implements brp.BevyRemoteService {
  private _url: string;
  private _currentId: number;
  private logger: (message: string, ...args: unknown[]) => void;

  public constructor(url: string, logger: (message: string, ...args: unknown[]) => void) {
    this._url = url;
    this._currentId = 0;
    this.logger = logger;
  }

  public get url(): string {
    return this._url;
  }
  public set url(value: string) {
    this._url = value;
  }

  public get currentId(): string {
    return this._currentId.toString();
  }

  async get(params: brp.GetStrictParams): Promise<brp.GetStrictResult>;
  async get(params: brp.GetLenientParams): Promise<brp.GetLenientResult>;
  async get(params: brp.GetParams): Promise<brp.GetResult> {
    return await this.doRequest(params, 'world.get_components');
  }

  public async query(params: brp.QueryParams): Promise<brp.QueryResult> {
    return await this.doRequest(params, 'world.query');
  }

  public async spawn(params: brp.SpawnParams): Promise<brp.SpawnResult> {
    return await this.doRequest(params, 'world.spawn_entity');
  }

  public async destroy(params: brp.DestroyParams): Promise<brp.DestroyResult> {
    return await this.doRequest(params, 'world.despawn_entity');
  }

  public async remove(params: brp.RemoveParams): Promise<brp.RemoveResult> {
    return await this.doRequest(params, 'world.remove_components');
  }

  public async insert(params: brp.InsertParams): Promise<brp.InsertResult> {
    return await this.doRequest(params, 'world.insert_components');
  }

  public async reparent(params: brp.ReparentParams): Promise<brp.ReparentResult> {
    return await this.doRequest(params, 'world.reparent_entities');
  }

  public async list(params?: brp.ListParams): Promise<brp.ListResult> {
    return await this.doRequest(params, 'world.list_components');
  }

  public async mutateComponent(params: brp.MutateComponentParams): Promise<brp.MutateComponentResult> {
    return await this.doRequest(params, 'world.mutate_component');
  }

  public async getWatch(params: brp.GetWatchParams): Promise<brp.GetWatchResult> {
    return await this.doRequest(params, 'world.get_components+watch');
  }

  public async listWatch(params: brp.ListWatchParams): Promise<brp.ListWatchResult> {
    return await this.doRequest(params, 'world.list_components+watch');
  }

  public async getResource(params: brp.GetResourceParams): Promise<brp.GetResourceResult> {
    return await this.doRequest(params, 'world.get_resources');
  }

  public async insertResource(params: brp.InsertResourceParams): Promise<brp.InsertResourceResult> {
    return await this.doRequest(params, 'world.insert_resources');
  }

  public async removeResource(params: brp.RemoveResourceParams): Promise<brp.RemoveResourceResult> {
    return await this.doRequest(params, 'world.remove_resources');
  }

  public async mutateResource(params: brp.MutateResourceParams): Promise<brp.MutateResourceResult> {
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

  private nextId(): number {
    return ++this._currentId;
  }

  private async doRequest<P, R>(params: P, method: string): Promise<R> {
    // Fix JsonRpcRequest that requires params to have type "P[]" instead of just "P".
    type RQ = Omit<JsonRpcRequest<P>, 'params'> & { params: P };
    type RS = JsonRpcResponse<R>;

    const request: RQ = {
      jsonrpc: '2.0',
      id: this.nextId(),
      method,
      params,
    };

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    this.logger('BRP request:', request);
    const response = await axios.post<RS, AxiosResponse<RS>, RQ>(this.url, request, config);
    this.logger('BRP response:', response.data);
    if (isJsonRpcSuccess<R>(response.data)) {
      return response.data.result;
    } else {
      return Promise.reject(response.data.error);
    }
  }
}
