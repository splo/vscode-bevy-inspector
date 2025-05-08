import * as vscode from 'vscode';
import type { EntitySelection } from '../EntitySelection';
import { PollingService } from '../polling';
import { TreeDataProvider } from './entitiesDataProvider';
import type { EntityNode, EntityTreeRepository } from './entityTree';

export class TreeController {
  private treeDataProvider: TreeDataProvider;
  private treeView: vscode.TreeView<EntityNode>;
  private pollingService: PollingService = new PollingService();
  private readonly entitySelectionEmitter = new vscode.EventEmitter<EntitySelection>();
  public readonly onSelectionChanged = this.entitySelectionEmitter.event;
  private readonly repository: EntityTreeRepository;

  constructor(context: vscode.ExtensionContext, repository: EntityTreeRepository) {
    this.repository = repository;
    this.treeDataProvider = new TreeDataProvider(repository);

    this.treeView = vscode.window.createTreeView('bevyInspector.entities', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    });

    this.treeView.onDidChangeSelection(this.handleSelectionChange.bind(this));
    context.subscriptions.push(this.treeView);

    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refresh', () => {
        // this.repository.invalidateCache();
        this.refresh();
      }),
      vscode.commands.registerCommand('bevyInspector.enablePolling', () => this.pollingService.enablePolling()),
      vscode.commands.registerCommand('bevyInspector.disablePolling', () => this.pollingService.disablePolling()),
      vscode.commands.registerCommand('bevyInspector.destroyEntity', async (entity) => {
        await this.repository.destroy(entity);
        this.refresh();
      }),
    );
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
        this.pollingService.restart();
      }
    });
  }

  public refresh() {
    this.treeDataProvider.refresh();
    if (this.treeView.selection.length > 0) {
      const selectedEntity = this.treeView.selection[0] as EntityNode;
      this.entitySelectionEmitter.fire({ entityId: selectedEntity.id });
    }
  }

  private handleSelectionChange(selectionChanged: vscode.TreeViewSelectionChangeEvent<EntityNode>) {
    if (selectionChanged.selection[0]) {
      const selectedEntity = selectionChanged.selection[0] as EntityNode;
      this.entitySelectionEmitter.fire({ entityId: selectedEntity.id });
    }
  }
}
