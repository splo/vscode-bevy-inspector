import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-types';
import { isJsonRpcSuccess } from 'json-rpc-types';
import type * as brp from '../brp';

export class JsonRpcBevyRemoteService implements brp.BevyRemoteService {
  public static DEFAULT_URL = 'http://127.0.0.1:15702';
  private _url: string;
  private _currentId: number;

  public constructor(url: string) {
    this._url = url;
    this._currentId = 0;
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

  async get(params: brp.BevyGetStrictParams): Promise<brp.BevyGetStrictResult>;
  async get(params: brp.BevyGetLenientParams): Promise<brp.BevyGetLenientResult>;
  async get(params: brp.BevyGetParams): Promise<brp.BevyGetResult> {
    return await this.doRequest(params, 'bevy/get');
  }

  public async query(params: brp.BevyQueryParams): Promise<brp.BevyQueryResult> {
    return await this.doRequest(params, 'bevy/query');
  }

  public async spawn(params: brp.BevySpawnParams): Promise<brp.BevySpawnResult> {
    return await this.doRequest(params, 'bevy/spawn');
  }

  public async destroy(params: brp.BevyDestroyParams): Promise<brp.BevyDestroyResult> {
    return await this.doRequest(params, 'bevy/destroy');
  }

  public async remove(params: brp.BevyRemoveParams): Promise<brp.BevyRemoveResult> {
    return await this.doRequest(params, 'bevy/remove');
  }

  public async insert(params: brp.BevyInsertParams): Promise<brp.BevyInsertResult> {
    return await this.doRequest(params, 'bevy/insert');
  }

  public async reparent(params: brp.BevyReparentParams): Promise<brp.BevyReparentResult> {
    return await this.doRequest(params, 'bevy/reparent');
  }

  public async list(params?: brp.BevyListParams): Promise<brp.BevyListResult> {
    return await this.doRequest(params, 'bevy/list');
  }

  public async mutateComponent(params: brp.BevyMutateComponentParams): Promise<brp.BevyMutateComponentResult> {
    return await this.doRequest(params, 'bevy/mutate_component');
  }

  public async getWatch(params: brp.BevyGetWatchParams): Promise<brp.BevyGetWatchResult> {
    return await this.doRequest(params, 'bevy/get+watch');
  }

  public async listWatch(params: brp.BevyListWatchParams): Promise<brp.BevyListWatchResult> {
    return await this.doRequest(params, 'bevy/list+watch');
  }

  public async getResource(params: brp.BevyGetResourceParams): Promise<brp.BevyGetResourceResult> {
    return await this.doRequest(params, 'bevy/get_resource');
  }

  public async insertResource(params: brp.BevyInsertResourceParams): Promise<brp.BevyInsertResourceResult> {
    return await this.doRequest(params, 'bevy/insert_resource');
  }

  public async removeResource(params: brp.BevyRemoveResourceParams): Promise<brp.BevyRemoveResourceResult> {
    return await this.doRequest(params, 'bevy/remove_resource');
  }

  public async mutateResource(params: brp.BevyMutateResourceParams): Promise<brp.BevyMutateResourceResult> {
    return await this.doRequest(params, 'bevy/mutate_resource');
  }

  public async listResources(params: brp.BevyListResourcesParams): Promise<brp.BevyListResourcesResult> {
    return await this.doRequest(params, 'bevy/list_resources');
  }

  public async registrySchema(params?: brp.BevyRegistrySchemaParams): Promise<brp.BevyRegistrySchemaResult> {
    return await this.doRequest(params, 'bevy/registry/schema');
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
    console.debug('BRP request:', request);
    const response = await axios.post<RS, AxiosResponse<RS>, RQ>(this.url, request, config);
    console.debug('BRP response:', response.data);
    if (isJsonRpcSuccess<R>(response.data)) {
      return response.data.result;
    } else {
      return Promise.reject(response.data.error);
    }
  }
}
