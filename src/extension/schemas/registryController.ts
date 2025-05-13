import * as vscode from 'vscode';
import { RegistryDataProvider } from './registryDataProvider';
import type { RegistryRepository } from './schemas';

export class RegistryController implements vscode.Disposable {
  private repository: RegistryRepository;
  private treeDataProvider: RegistryDataProvider;
  private treeView: vscode.TreeView<unknown>;

  constructor(context: vscode.ExtensionContext, repository: RegistryRepository) {
    this.repository = repository;
    this.treeDataProvider = new RegistryDataProvider();
    this.treeView = vscode.window.createTreeView('bevyInspector.schemas', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    });
    context.subscriptions.push(this.treeView);
    this.repository.registry().then(this.treeDataProvider.setRegistry.bind(this.treeDataProvider));
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refreshSchemas', this.refresh.bind(this)),
    );
  }

  dispose() {
    this.treeView.dispose();
  }

  public async refresh() {
    console.debug(`[${new Date().toISOString()}] Refreshing registry view`);
    const registry = await this.repository.registry();
    this.treeDataProvider.setRegistry(registry);
  }
}
