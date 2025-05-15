import * as vscode from 'vscode';
import { V0_15BevyRemoteService } from '../../brp/http/v0_15JsonRpcBrp';
import { V0_16BevyRemoteService } from '../../brp/http/v0_16JsonRpcBrp';
import { logger } from '../vscode/logger';
import type { ConnectionChange } from './server';
import { isServer, type Server, type ServerRepository } from './server';
import { ServerDataProvider } from './serverDataProvider';

export class ServerController {
  private repository: ServerRepository;
  private dataProvider: ServerDataProvider;
  private treeView: vscode.TreeView<Server>;
  private statusBar: vscode.StatusBarItem;
  private readonly connectionChangeEmmiter = new vscode.EventEmitter<ConnectionChange>();
  public readonly onConnectionChanged = this.connectionChangeEmmiter.event;

  constructor(context: vscode.ExtensionContext, repository: ServerRepository) {
    this.repository = repository;
    this.dataProvider = new ServerDataProvider();
    this.treeView = vscode.window.createTreeView('bevyInspector.servers', {
      treeDataProvider: this.dataProvider,
      showCollapseAll: false,
      canSelectMany: false,
    });
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    this.setStatusBarStatus('Disconnected');
    this.statusBar.show();
    this.initializeServers();
    context.subscriptions.push(this.treeView, this.statusBar);
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.addServer', this.addServer.bind(this)),
      vscode.commands.registerCommand('bevyInspector.removeServer', this.removeServer.bind(this)),
      vscode.commands.registerCommand('bevyInspector.connect', this.connect.bind(this)),
      vscode.commands.registerCommand('bevyInspector.disconnect', this.disconnect.bind(this)),
    );
  }

  async initializeServers(): Promise<void> {
    const servers = await this.repository.list();
    this.dataProvider.setServers(servers);
    const lastConnectedId = await this.repository.getLastConnected();
    if (lastConnectedId !== undefined) {
      const server = servers.find((server) => server.id === lastConnectedId);
      if (server !== undefined) {
        this.connect(server);
      }
    }
  }

  async addServer(): Promise<void> {
    const url = await vscode.window.showInputBox({ prompt: 'Enter server URL', value: 'http://127.0.0.1:15702' });
    if (url) {
      const server = await this.repository.add(url);
      this.dataProvider.setServers(await this.repository.list());
      await this.connect(server);
    }
  }

  async removeServer(server: unknown): Promise<void> {
    if (isServer(server)) {
      const lastConnectedId = await this.repository.getLastConnected();
      if (lastConnectedId === server.id) {
        await this.disconnect(server);
      }
      await this.repository.remove(server.id);
      this.dataProvider.setServers(await this.repository.list());
    }
  }

  async connect(server: unknown): Promise<void> {
    if (isServer(server)) {
      this.setStatusBarStatus('Connecting');
      const connectedServer = await this.repository.getLastConnected().then((lastConnectedId) => {
        if (lastConnectedId !== undefined) {
          return this.repository.list().then((servers) => servers.find((s) => s.id === lastConnectedId));
        }
        return undefined;
      });
      if (connectedServer !== undefined) {
        await this.disconnect(connectedServer);
      }
      const updatedServer = {
        ...server,
      };
      try {
        const service = new V0_16BevyRemoteService(server.url, logger.debug);
        const serverInfo = await service.discover();
        updatedServer.name = serverInfo.servers[0].name;
        updatedServer.version = serverInfo.info.version;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        try {
          const service = new V0_15BevyRemoteService(server.url, logger.debug);
          await service.query({ data: {} });
          updatedServer.version = '0.15.x';
        } catch (error: unknown) {
          vscode.window.showErrorMessage(`Failed to connect to '${server.url}'. ${error}`, 'Retry').then((value) => {
            if (value === 'Retry') {
              this.connect(server);
            }
          });
          return;
        }
      }
      await this.repository.update(updatedServer);
      await this.repository.setLastConnected(updatedServer.id);
      this.dataProvider.setConnectedServerId(updatedServer.id);
      this.dataProvider.setServers(await this.repository.list());
      vscode.commands.executeCommand('setContext', 'bevyInspector.connected', true);
      this.setStatusBarStatus('Connected', updatedServer);
      this.connectionChangeEmmiter.fire({
        server: updatedServer,
        connected: true,
      });
    }
  }

  async disconnect(server: unknown): Promise<void> {
    if (isServer(server)) {
      await this.repository.update({
        ...server,
      });
      await this.repository.setLastConnected(undefined);
      this.dataProvider.setConnectedServerId(undefined);
      this.dataProvider.setServers(await this.repository.list());
      vscode.commands.executeCommand('setContext', 'bevyInspector.connected', false);
      this.setStatusBarStatus('Disconnected');
      this.connectionChangeEmmiter.fire({
        server,
        connected: false,
      });
    }
  }

  private setStatusBarStatus(status: StatusBarStatus, server?: Server): void {
    switch (status) {
      case 'Connecting': {
        this.statusBar.command = 'bevyInspector.disconnect';
        this.statusBar.text = `$(sync~spin) Connecting...`;
        break;
      }
      case 'Connected': {
        this.statusBar.command = 'bevyInspector.disconnect';
        this.statusBar.text = `$(vm-active) ${server?.version ?? 'Connected'}`;
        break;
      }
      case 'Disconnected': {
        this.statusBar.command = 'bevyInspector.connect';
        this.statusBar.text = `$(vm-connect) Not connected`;
        break;
      }
    }
  }
}

type StatusBarStatus = 'Connecting' | 'Connected' | 'Disconnected';
