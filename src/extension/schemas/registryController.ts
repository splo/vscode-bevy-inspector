import * as vscode from 'vscode';
import { logger } from '../vscode/logger';
import { RegistryDataProvider } from './registryDataProvider';
import type { RegistryRepository } from './registryRepository';

export class RegistryController implements vscode.Disposable {
  private repository: RegistryRepository;
  private treeDataProvider: RegistryDataProvider;
  private treeView: vscode.TreeView<unknown>;
  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext, repository: RegistryRepository) {
    this.repository = repository;
    this.treeDataProvider = new RegistryDataProvider();
    this.treeView = vscode.window.createTreeView('bevyInspector.schemas', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    });
    this.disposables.push(this.treeView);
    this.repository.registry().then(this.treeDataProvider.setRegistry.bind(this.treeDataProvider));
    this.disposables.push(vscode.commands.registerCommand('bevyInspector.refreshSchemas', this.refresh.bind(this)));

    context.subscriptions.push(...this.disposables);
  }

  dispose() {
    this.treeView.dispose();
    this.disposables.forEach((d) => d.dispose());
  }

  public async refresh() {
    logger.debug(`Refreshing registry view`);
    const registry = await this.repository.registry();
    this.treeDataProvider.setRegistry(registry);
  }
}
