import * as vscode from 'vscode';
import type { CachedInspectorRepository } from '../../cache/cachedInspectorRepository';
import { PollingService } from '../polling';
import type { SelectionChange } from '../selectionChange';
import { EntityItem, ResourceItem, TreeDataProvider, TreeItem } from './treeDataProvider';

export class TreeController {
  private treeDataProvider: TreeDataProvider;
  private treeView: vscode.TreeView<TreeItem>;
  private pollingService: PollingService = new PollingService();
  private readonly selectionChangeEmitter = new vscode.EventEmitter<SelectionChange>();
  public readonly onSelectionChanged = this.selectionChangeEmitter.event;
  private readonly cachedRepository: CachedInspectorRepository;

  constructor(context: vscode.ExtensionContext, cachedRepository: CachedInspectorRepository) {
    this.cachedRepository = cachedRepository;
    this.treeDataProvider = new TreeDataProvider(cachedRepository);

    this.treeView = vscode.window.createTreeView('bevyInspector.tree', {
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
      const selectedItem = this.treeView.selection[0];
      if (selectedItem instanceof EntityItem) {
        this.selectionChangeEmitter.fire({ type: 'Entity', entityId: selectedItem.entityId });
      } else if (selectedItem instanceof ResourceItem) {
        this.selectionChangeEmitter.fire({ type: 'Resource', typePath: selectedItem.typePath });
      }
    }
  }

  private handleSelectionChange(selectionChanged: vscode.TreeViewSelectionChangeEvent<TreeItem>) {
    let selection: SelectionChange = { type: 'NonInspectable' };

    if (Array.isArray(selectionChanged.selection) && selectionChanged.selection[0] instanceof TreeItem) {
      const treeItem = selectionChanged.selection[0];

      if (treeItem.type === 'Resource') {
        const resourceItem = treeItem as ResourceItem;
        selection = { type: 'Resource', typePath: resourceItem.typePath };
      } else if (treeItem.type === 'Entity') {
        const entityItem = treeItem as EntityItem;
        selection = { type: 'Entity', entityId: entityItem.entityId };
      }
    }

    this.selectionChangeEmitter.fire(selection);
  }
}
