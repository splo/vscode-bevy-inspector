import * as vscode from 'vscode';
import type { UpdateRequestedEvent, ValuesUpdatedEvent, ViewEvent } from '../../inspector-data/messages';
import { UpdateRequested, ValuesUpdated, ViewReady } from '../../inspector-data/messages';
import { isEventMessage } from '../../messages/types';
import type { EntityNode } from '../entities/entityTree';
import { PollingService } from '../vscode/polling';
import type { ComponentRepository, EntityUpdated } from './components';
import { ComponentsViewProvider } from './componentsViewProvider';

export class ComponentsController {
  private repository: ComponentRepository;
  private componentsViewProvider: ComponentsViewProvider;
  private selectedEntity: EntityNode | undefined;
  private pollingService: PollingService = new PollingService();
  private readonly valueUpdatedEmitter = new vscode.EventEmitter<EntityUpdated>();
  public readonly onValueUpdated: vscode.Event<EntityUpdated> = this.valueUpdatedEmitter.event;

  constructor(context: vscode.ExtensionContext, repository: ComponentRepository) {
    this.repository = repository;
    this.componentsViewProvider = new ComponentsViewProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('bevyInspector.components', this.componentsViewProvider),
    );
    this.componentsViewProvider.onMessageReceived(this.handleMessage.bind(this));
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refreshComponents', () => this.refresh()),
      vscode.commands.registerCommand('bevyInspector.enableComponentsPolling', () => {
        vscode.commands.executeCommand('setContext', 'bevyInspector.componentsPollingEnabled', true);
        this.pollingService.enablePolling();
      }),
      vscode.commands.registerCommand('bevyInspector.disableComponentsPolling', () => {
        vscode.commands.executeCommand('setContext', 'bevyInspector.componentsPollingEnabled', false);
        this.pollingService.disablePolling();
      }),
    );
    this.pollingService.onRefresh(async () => this.refresh());
    // Enable polling by default.
    vscode.commands.executeCommand('bevyInspector.enableComponentsPolling');
  }

  public async updateSelection(selectedEntity: EntityNode | undefined): Promise<void> {
    this.selectedEntity = selectedEntity;
    await this.refresh();
  }

  private async handleMessage(message: unknown): Promise<void> {
    if (isEventMessage(message)) {
      const event = message as ViewEvent;
      switch (event.type) {
        case ViewReady: {
          break;
        }
        case UpdateRequested: {
          const updated = await this.setComponentValue(event);
          if (updated) {
            this.refresh();
          }
          break;
        }
        // Ignore others.
      }
    }
  }

  private async refresh() {
    if (this.selectedEntity === undefined) {
      this.componentsViewProvider.updateWithNoSelection();
    } else {
      const components = await this.repository.listEntityComponents(this.selectedEntity);
      this.componentsViewProvider.updateWithSelectedEntity(this.selectedEntity, components);
      this.componentsViewProvider.postMessage({
        type: ValuesUpdated,
        data: components,
      } satisfies ValuesUpdatedEvent);
    }
  }

  private async setComponentValue(event: UpdateRequestedEvent): Promise<boolean> {
    try {
      if (this.selectedEntity === undefined) {
        throw new Error('No entity selected');
      }
      await this.repository.setComponentValue(
        this.selectedEntity.id,
        event.data.typePath,
        event.data.path,
        event.data.newValue,
      );
      this.valueUpdatedEmitter.fire({
        entityId: this.selectedEntity.id,
        typePath: event.data.typePath,
        path: event.data.path,
        newValue: event.data.newValue,
      });
      return true;
    } catch (error: unknown) {
      const message = (error as Error).message;
      vscode.window.showErrorMessage(`Error setting component value: ${message}`);
      return false;
    }
  }
}
