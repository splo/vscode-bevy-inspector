import * as vscode from 'vscode';
import type { Server } from './server';

class ServerItem extends vscode.TreeItem {
  constructor(server: Server, connected: boolean) {
    const name = connected ? (server.name ?? server.url) : server.url;
    super(name);
    this.id = String(server.id);
    this.description = connected ? server.version : 'Disconnected';
    this.tooltip = server.url;
    this.iconPath = new vscode.ThemeIcon('server');
    this.contextValue = connected ? 'connectedServer' : 'disconnectedServer';
  }
}

type ServerDataChange = void | Server | Server[] | null | undefined;

export class ServerDataProvider implements vscode.TreeDataProvider<Server> {
  private readonly serverDataChangeEmitter = new vscode.EventEmitter<ServerDataChange>();
  public readonly onDidChangeTreeData = this.serverDataChangeEmitter.event;

  private servers: Server[] | undefined;
  private connectedServerId: number | undefined;

  public setServers(value: Server[] | undefined) {
    this.servers = value;
    this.serverDataChangeEmitter.fire();
  }

  public setConnectedServerId(value: number | undefined) {
    this.connectedServerId = value;
    this.serverDataChangeEmitter.fire();
  }

  getTreeItem(element: Server): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new ServerItem(element, this.connectedServerId === element.id);
  }

  getChildren(element?: Server | undefined): vscode.ProviderResult<Server[]> {
    if (element === undefined) {
      return this.servers;
    } else {
      return [];
    }
  }
}
