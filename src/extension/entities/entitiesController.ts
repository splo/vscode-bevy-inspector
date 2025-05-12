import * as vscode from 'vscode';
import type { EntityUpdated } from '../components/components';
import { DEFAULT_POLLING_DELAY, PollingService } from '../vscode/polling';
import { EntityTreeDataProvider } from './entitiesDataProvider';
import { isEntityNode, type EntityNode, type EntityTreeRepository } from './entityTree';

export class TreeController {
  private repository: EntityTreeRepository;
  private treeDataProvider: EntityTreeDataProvider;
  private treeView: vscode.TreeView<EntityNode>;
  private pollingService: PollingService = new PollingService();
  private readonly entityNodeEmitter = new vscode.EventEmitter<EntityNode | undefined>();
  public readonly onSelectionChanged = this.entityNodeEmitter.event;

  constructor(context: vscode.ExtensionContext, repository: EntityTreeRepository) {
    this.repository = repository;
    this.treeDataProvider = new EntityTreeDataProvider();
    this.treeView = vscode.window.createTreeView('bevyInspector.entities', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    });
    context.subscriptions.push(this.treeView);
    this.repository.tree().then(this.treeDataProvider.setEntities.bind(this.treeDataProvider));
    this.treeView.onDidChangeSelection(this.handleSelectionChange.bind(this));
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refreshEntities', this.refresh.bind(this)),
      vscode.commands.registerCommand('bevyInspector.enableEntitiesPolling', this.enablePolling.bind(this)),
      vscode.commands.registerCommand('bevyInspector.disableEntitiesPolling', this.disablePolling.bind(this)),
    );
    this.pollingService.onRefresh(this.refresh.bind(this));
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
        const delay = vscode.workspace.getConfiguration('bevyInspector').get('pollingDelay', DEFAULT_POLLING_DELAY);
        this.pollingService.setDelay(delay);
      }
    });
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.spawnEntity', this.spawnEntity.bind(this)),
      vscode.commands.registerCommand('bevyInspector.destroyEntity', this.destroyEntity.bind(this)),
    );
  }

  private async enablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.entitiesPollingEnabled', true);
    this.pollingService.enablePolling();
  }

  private async disablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.entitiesPollingEnabled', false);
    this.pollingService.disablePolling();
  }

  public async refresh() {
    const entities = await this.repository.tree();
    this.treeDataProvider.setEntities(entities);
    this.entityNodeEmitter.fire(this.treeView.selection[0]);
  }

  public refreshNames(entityUpdated: EntityUpdated) {
    if (this.repository.isNameType(entityUpdated.typePath) && typeof entityUpdated.newValue === 'string') {
      this.treeDataProvider.setEntityName(entityUpdated.entityId, entityUpdated.newValue);
    }
  }

  private handleSelectionChange(selectionChanged: vscode.TreeViewSelectionChangeEvent<EntityNode>) {
    this.entityNodeEmitter.fire(selectionChanged.selection[0]);
  }

  private async spawnEntity(): Promise<void> {
    const newEntity = await this.repository.spawn();
    await this.refresh();
    this.treeView.reveal(newEntity, { select: true, focus: true });
  }

  private async destroyEntity(entity: unknown): Promise<void> {
    if (isEntityNode(entity)) {
      await this.repository.destroy(entity);
      if (this.treeView.selection[0]?.id === entity.id) {
        this.entityNodeEmitter.fire(undefined);
      }
      await this.refresh();
    }
  }
}
