import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-types';
import { isJsonRpcSuccess } from 'json-rpc-types';

export class JsonRpcClient {
  _url: string;
  _currentId: number;
  logger: (message: string, ...args: unknown[]) => void;

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

  nextId(): number {
    return ++this._currentId;
  }

  async doRequest<P, R>(params: P, method: string): Promise<R> {
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
    this.logger('JSON-RPC request:', request);
    const response = await axios.post<RS, AxiosResponse<RS>, RQ>(this.url, request, config);
    this.logger('JSON-RPC response:', response.data);
    if (isJsonRpcSuccess<R>(response.data)) {
      return response.data.result;
    } else {
      return Promise.reject(response.data.error);
    }
  }
}
