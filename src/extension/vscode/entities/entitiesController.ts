import * as vscode from 'vscode';
import type { CachedInspectorRepository } from '../../cache/cachedInspectorRepository';
import type { EntitySelection } from '../EntitySelection';
import { PollingService } from '../polling';
import { EntityItem, TreeDataProvider } from './entitiesDataProvider';

export class TreeController {
  private treeDataProvider: TreeDataProvider;
  private treeView: vscode.TreeView<EntityItem>;
  private pollingService: PollingService = new PollingService();
  private readonly entitySelectionEmitter = new vscode.EventEmitter<EntitySelection>();
  public readonly onSelectionChanged = this.entitySelectionEmitter.event;
  private readonly cachedRepository: CachedInspectorRepository;

  constructor(context: vscode.ExtensionContext, cachedRepository: CachedInspectorRepository) {
    this.cachedRepository = cachedRepository;
    this.treeDataProvider = new TreeDataProvider(cachedRepository);

    this.treeView = vscode.window.createTreeView('bevyInspector.entities', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    });

    this.treeView.onDidChangeSelection(this.handleSelectionChange.bind(this));
    context.subscriptions.push(this.treeView);

    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refresh', () => {
        this.cachedRepository.invalidateCache();
        this.refresh();
      }),
      vscode.commands.registerCommand('bevyInspector.enablePolling', () => this.pollingService.enablePolling()),
      vscode.commands.registerCommand('bevyInspector.disablePolling', () => this.pollingService.disablePolling()),
      vscode.commands.registerCommand('bevyInspector.destroyEntity', async (entity) => {
        await cachedRepository.destroyEntity(entity.entityId);
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
      const selectedItem = this.treeView.selection[0] as EntityItem;
      this.entitySelectionEmitter.fire({ entityId: selectedItem.entityId });
    }
  }

  private handleSelectionChange(selectionChanged: vscode.TreeViewSelectionChangeEvent<EntityItem>) {
    if (Array.isArray(selectionChanged.selection) && selectionChanged.selection[0] instanceof EntityItem) {
      const treeItem = selectionChanged.selection[0];
      const entityItem = treeItem as EntityItem;
      this.entitySelectionEmitter.fire({ entityId: entityItem.entityId });
    }
  }
}
