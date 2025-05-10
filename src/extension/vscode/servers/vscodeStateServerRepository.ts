import type * as vscode from 'vscode';
import type { Server, ServerRepository } from './server';

export class VscodeStateServerRepository implements ServerRepository {
  state: vscode.Memento;

  constructor(state: vscode.Memento) {
    this.state = state;
  }

  public list(): Promise<Server[]> {
    return Promise.resolve(this.fetchData());
  }

  public add(url: string): Promise<Server> {
    const servers = this.fetchData();
    const nextId = servers.map((server) => server.id).reduce((a, b) => Math.max(a, b), 0) + 1;
    const newServer = { id: nextId, url };
    servers.push(newServer);
    this.persistData(servers);
    return Promise.resolve(newServer);
  }

  public remove(serverId: number): Promise<void> {
    const servers = this.fetchData();
    const updatedServers = servers.filter((server) => server.id !== serverId);
    this.persistData(updatedServers);
    return Promise.resolve();
  }

  public update(updatedServer: Server): Promise<void> {
    const servers = this.fetchData();
    const updatedServers = servers.map((server) => {
      if (server.id === updatedServer.id) {
        return { ...server, ...updatedServer };
      }
      return server;
    });
    this.persistData(updatedServers);
    return Promise.resolve();
  }

  public getLastConnected(): Promise<number | undefined> {
    return Promise.resolve(this.state.get<number>('bevyInspector.lastConnected'));
  }

  public setLastConnected(id: number | undefined): Promise<void> {
    return Promise.resolve(this.state.update('bevyInspector.lastConnected', id));
  }

  private fetchData(): Server[] {
    return this.state.get<Server[]>('bevyInspector.servers') ?? [];
  }

  private persistData(servers: Server[]): void {
    this.state.update('bevyInspector.servers', servers);
  }
}
