import * as vscode from 'vscode';
import type { EntityUpdated } from '../components/components';
import { PollingService } from '../polling';
import { EntityTreeDataProvider } from './entitiesDataProvider';
import type { EntityNode, EntityTreeRepository } from './entityTree';

export class TreeController {
  private repository: EntityTreeRepository;
  private treeDataProvider: EntityTreeDataProvider;
  private treeView: vscode.TreeView<EntityNode>;
  private pollingService: PollingService = new PollingService();
  private readonly entityNodeEmitter = new vscode.EventEmitter<EntityNode>();
  public readonly onSelectionChanged = this.entityNodeEmitter.event;

  constructor(context: vscode.ExtensionContext, repository: EntityTreeRepository) {
    this.repository = repository;
    this.treeDataProvider = new EntityTreeDataProvider();
    this.treeView = vscode.window.createTreeView('bevyInspector.entities', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    });
    this.repository.tree().then(this.treeDataProvider.setEntities.bind(this.treeDataProvider));
    this.treeView.onDidChangeSelection(this.handleSelectionChange.bind(this));
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refresh', () => this.refresh()),
      vscode.commands.registerCommand('bevyInspector.enablePolling', () => this.pollingService.enablePolling()),
      vscode.commands.registerCommand('bevyInspector.disablePolling', () => this.pollingService.disablePolling()),
      vscode.commands.registerCommand('bevyInspector.destroyEntity', async (entity) => {
        if (entity !== undefined && this.repository !== null) {
          await this.repository.destroy(entity);
          this.refresh();
        }
      }),
    );
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
        this.pollingService.restart();
      }
    });
  }

  public refresh() {
    this.repository.tree().then(this.treeDataProvider.setEntities.bind(this.treeDataProvider));
    if (this.treeView.selection.length > 0) {
      this.entityNodeEmitter.fire(this.treeView.selection[0]);
    }
  }

  public refreshNames(entityUpdated: EntityUpdated) {
    if (this.repository.isNameType(entityUpdated.typePath) && typeof entityUpdated.newValue === 'string') {
      this.treeDataProvider.setEntityName(entityUpdated.entityId, entityUpdated.newValue);
    }
  }

  private handleSelectionChange(selectionChanged: vscode.TreeViewSelectionChangeEvent<EntityNode>) {
    this.entityNodeEmitter.fire(selectionChanged.selection[0]);
  }
}
