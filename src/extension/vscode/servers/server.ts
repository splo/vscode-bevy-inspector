export interface Server {
  id: number;
  url: string;
  name?: string | undefined;
  version?: string | undefined;
}

export interface ServerRepository {
  list(): Promise<Server[]>;
  add(url: string): Promise<Server>;
  remove(serverId: number): Promise<void>;
  update(server: Server): Promise<void>;
  getLastConnected(): Promise<number | undefined>;
  setLastConnected(id: number | undefined): Promise<void>;
}
