import type * as brp from '../brp-0.15';
import { JsonRpcClient } from './jsonRpcClient';

export class V0_15BevyRemoteService extends JsonRpcClient implements brp.BevyRemoteService {
  public constructor(url: string, logger: (message: string, ...args: unknown[]) => void) {
    super(url, logger);
  }

  public async get(params: brp.GetStrictParams): Promise<brp.GetStrictResult>;
  public async get(params: brp.GetLenientParams): Promise<brp.GetLenientResult>;
  public async get(params: brp.GetParams): Promise<brp.GetResult> {
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
}
