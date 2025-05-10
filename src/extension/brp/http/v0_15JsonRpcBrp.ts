import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-types';
import { isJsonRpcSuccess } from 'json-rpc-types';
import type * as brp from '../../../brp/brp-0.15';

export class V0_15BevyRemoteService implements brp.BevyRemoteService {
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

  async get(params: brp.GetStrictParams): Promise<brp.GetStrictResult>;
  async get(params: brp.GetLenientParams): Promise<brp.GetLenientResult>;
  async get(params: brp.GetParams): Promise<brp.GetResult> {
    return await this.doRequest(params, 'bevy/get');
  }

  public async query(params: brp.QueryParams): Promise<brp.QueryResult> {
    return await this.doRequest(params, 'bevy/query');
  }

  public async spawn(params: brp.SpawnParams): Promise<brp.SpawnResult> {
    return await this.doRequest(params, 'bevy/spawn');
  }

  public async destroy(params: brp.DestroyParams): Promise<brp.DestroyResult> {
    return await this.doRequest(params, 'bevy/destroy');
  }

  public async remove(params: brp.RemoveParams): Promise<brp.RemoveResult> {
    return await this.doRequest(params, 'bevy/remove');
  }

  public async insert(params: brp.InsertParams): Promise<brp.InsertResult> {
    return await this.doRequest(params, 'bevy/insert');
  }

  public async reparent(params: brp.ReparentParams): Promise<brp.ReparentResult> {
    return await this.doRequest(params, 'bevy/reparent');
  }

  public async list(params?: brp.ListParams): Promise<brp.ListResult> {
    return await this.doRequest(params, 'bevy/list');
  }

  public async getWatch(params: brp.GetWatchParams): Promise<brp.GetWatchResult> {
    return await this.doRequest(params, 'bevy/get+watch');
  }

  public async listWatch(params: brp.ListWatchParams): Promise<brp.ListWatchResult> {
    return await this.doRequest(params, 'bevy/list+watch');
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
