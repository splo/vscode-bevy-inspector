import * as vscode from 'vscode';
import type { UpdateRequestedEvent, ValuesUpdatedEvent, ViewEvent } from '../../inspector-data/messages';
import { UpdateRequested, ValuesUpdated, ViewReady } from '../../inspector-data/messages';
import type { TypePath } from '../../inspector-data/types';
import { isEventMessage } from '../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import { DEFAULT_POLLING_DELAY, PollingService } from '../vscode/polling';
import type { ComponentRepository, EntityUpdated } from './components';
import { ComponentsViewProvider } from './componentsViewProvider';

export class ComponentsController implements vscode.Disposable {
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
      vscode.window.registerWebviewViewProvider('bevyInspector.components', this.componentsViewProvider, {
        webviewOptions: { retainContextWhenHidden: true },
      }),
    );
    this.componentsViewProvider.onMessageReceived(this.handleMessage.bind(this));
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refreshComponents', this.refresh.bind(this)),
      vscode.commands.registerCommand('bevyInspector.enableComponentsPolling', this.enablePolling.bind(this)),
      vscode.commands.registerCommand('bevyInspector.disableComponentsPolling', this.disablePolling.bind(this)),
    );
    this.pollingService.onRefresh(this.refresh.bind(this));
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
        const delay = vscode.workspace.getConfiguration('bevyInspector').get('pollingDelay', DEFAULT_POLLING_DELAY);
        this.pollingService.setDelay(delay);
      }
    });
    // Enable polling by default.
    this.enablePolling();

    this.componentsViewProvider.onVisibilityChanged((visible) => {
      if (visible) {
        this.enablePolling();
      } else {
        this.disablePolling();
      }
    });

    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.insertComponent', this.insertComponent.bind(this)),
    );
  }

  dispose() {
    this.disablePolling();
    this.selectedEntity = undefined;
  }

  public async updateSelection(selectedEntity: EntityNode | undefined): Promise<void> {
    this.selectedEntity = selectedEntity;
    await this.refresh();
  }

  private async enablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.componentsPollingEnabled', true);
    this.pollingService.enablePolling();
  }

  private async disablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.componentsPollingEnabled', false);
    this.pollingService.disablePolling();
  }

  private async refresh() {
    console.debug(`[${new Date().toISOString()}] Refreshing components view`);
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

  private async insertComponent(): Promise<void> {
    if (this.selectedEntity === undefined) {
      vscode.window.showErrorMessage('No entity selected');
    } else {
      const typePath = await this.promptForTypePath();
      if (typePath) {
        const jsonValue = await vscode.window.showInputBox({
          prompt: 'Enter the component value in JSON format',
          placeHolder: '"New Component" or { "translation": [0, 1, 0], "scale": [1, 1, 1], "rotation": [0, 0, 0, 1] }',
          ignoreFocusOut: true,
        });
        if (jsonValue) {
          try {
            const value = JSON.parse(jsonValue);
            await this.repository.insertComponent(this.selectedEntity.id, typePath, value);
            this.selectedEntity.componentNames.push(typePath);
            this.refresh();
            this.valueUpdatedEmitter.fire({
              entityId: this.selectedEntity.id,
              typePath,
              path: '',
              newValue: value,
            });
          } catch (error: unknown) {
            vscode.window.showErrorMessage(`Error inserting component: ${(error as Error).message}`);
          }
        }
      }
    }
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

  private async promptForTypePath(): Promise<TypePath | undefined> {
    try {
      const items = await this.repository.listTypePaths();
      return await vscode.window.showQuickPick(items, {
        title: 'Enter the component type to insert',
        ignoreFocusOut: true,
        canPickMany: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return await vscode.window.showInputBox({
        title: 'Enter the component type to insert',
        placeHolder: 'bevy_core::name::Name or bevy_transform::components::transform::Transform',
        ignoreFocusOut: true,
      });
    }
  }
}
