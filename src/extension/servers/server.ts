export interface Server {
  id: number;
  url: string;
  name?: string | undefined;
  version?: string | undefined;
}

export function isServer(object: unknown): object is Server {
  return typeof object === 'object' && object !== null && 'id' in object && 'url' in object;
}

export interface ConnectionChange {
  server: Server;
  connected: boolean;
}

export interface ServerRepository {
  list(): Promise<Server[]>;
  add(url: string): Promise<Server>;
  remove(serverId: number): Promise<void>;
  update(server: Server): Promise<void>;
  getLastConnected(): Promise<number | undefined>;
  setLastConnected(id: number | undefined): Promise<void>;
}
