import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { JsonRpcRequest, JsonRpcResponse, isJsonRpcSuccess } from 'json-rpc-types';
import * as brp from './brp';

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

    public async get(params: brp.BevyGetParams): Promise<brp.BevyGetResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/get',
            params,
        };
        return await this.doRequest(request);
    }

    public async query(params: brp.BevyQueryParams): Promise<brp.BevyQueryResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/query',
            params,
        };
        return await this.doRequest(request);
    }

    public async spawn(params: brp.BevySpawnParams): Promise<brp.BevySpawnResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/spawn',
            params,
        };
        return await this.doRequest(request);
    }

    public async destroy(params: brp.BevyDestroyParams): Promise<brp.BevyDestroyResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/destroy',
            params,
        };
        return await this.doRequest(request);
    }

    public async remove(params: brp.BevyRemoveParams): Promise<brp.BevyRemoveResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/remove',
            params,
        };
        return await this.doRequest(request);
    }

    public async insert(params: brp.BevyInsertParams): Promise<brp.BevyInsertResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/insert',
            params,
        };
        return await this.doRequest(request);
    }

    public async reparent(params: brp.BevyReparentParams): Promise<brp.BevyReparentResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/reparent',
            params,
        };
        return await this.doRequest(request);
    }

    public async list(params?: brp.BevyListParams): Promise<brp.BevyListResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/list',
            params,
        };
        return await this.doRequest(request);
    }

    public async getWatch(params: brp.BevyGetWatchParams): Promise<brp.BevyGetWatchResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/get+watch',
            params,
        };
        return await this.doRequest(request);
    }

    public async listWatch(params: brp.BevyListWatchParams): Promise<brp.BevyListWatchResult> {
        const request: JsonRpcRequest<any> = {
            jsonrpc: '2.0',
            id: this.nextId(),
            method: 'bevy/list+watch',
            params,
        };
        return await this.doRequest(request);
    }

    private nextId(): number {
        return ++this._currentId;
    }

    private async doRequest<P, R>(request: JsonRpcRequest<P>): Promise<R> {
        type RQ = JsonRpcRequest<P>;
        type RS = JsonRpcResponse<R>;

        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        console.debug('request', request);
        const response = await axios.post<RS, AxiosResponse<RS>, RQ>(this.url, request, config);
        console.debug('response.data', response.data);
        if (isJsonRpcSuccess<R>(response.data)) {
            return response.data.result;
        } else {
            throw new JsonRpcBevyError(response.data.error);
        }
    }
}

class JsonRpcBevyError implements brp.BevyError {
    public readonly code?: number;
    public readonly message?: string;
    public readonly data?: any;

    constructor(error?: { code: number; message: string; data?: any }) {
        this.code = error?.code;
        this.message = error?.message;
        this.data = error?.data;
    }
}
