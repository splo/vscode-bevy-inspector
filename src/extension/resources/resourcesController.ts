import * as vscode from 'vscode';
import type { UpdateRequestedEvent, ValuesUpdatedEvent, ViewEvent } from '../../inspector-data/messages';
import {
  CollapsibleStateChanged,
  SetCollapsibleState,
  UpdateRequested,
  ValuesUpdated,
  ViewReady,
} from '../../inspector-data/messages';
import type { TypePath } from '../../inspector-data/types';
import { isEventMessage } from '../../inspector-data/types';
import { logger } from '../vscode/logger';
import { DEFAULT_POLLING_DELAY, PollingService } from '../vscode/polling';
import type { ResourceRepository } from './resourceRepository';
import { ResourcesViewProvider } from './resourcesViewProvider';

export class ResourcesController implements vscode.Disposable {
  private repository: ResourceRepository;
  private resourcesViewProvider: ResourcesViewProvider;
  private pollingService: PollingService = new PollingService();

  constructor(context: vscode.ExtensionContext, repository: ResourceRepository) {
    this.repository = repository;
    this.resourcesViewProvider = new ResourcesViewProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('bevyInspector.resources', this.resourcesViewProvider),
    );
    this.resourcesViewProvider.onMessageReceived(this.handleMessage.bind(this));
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refreshResources', this.refresh.bind(this)),
      vscode.commands.registerCommand('bevyInspector.enableResourcesPolling', this.enablePolling.bind(this)),
      vscode.commands.registerCommand('bevyInspector.disableResourcesPolling', this.disablePolling.bind(this)),
      vscode.commands.registerCommand('bevyInspector.expandAllResources', this.expandAll.bind(this)),
      vscode.commands.registerCommand('bevyInspector.collapseAllResources', this.collapseAll.bind(this)),
    );
    this.pollingService.onRefresh(this.refresh.bind(this));
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
        const delay = vscode.workspace.getConfiguration('bevyInspector').get('pollingDelay', DEFAULT_POLLING_DELAY);
        this.pollingService.setDelay(delay);
      }
    });

    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.insertResource', this.insertResource.bind(this)),
    );

    vscode.commands.executeCommand('setContext', 'bevyInspector.anyResourceExpanded', false);
  }

  dispose() {
    this.disablePolling();
  }

  private async enablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesPollingEnabled', true);
    this.pollingService.enablePolling();
  }

  private async disablePolling() {
    vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesPollingEnabled', false);
    this.pollingService.disablePolling();
  }

  private async refresh() {
    logger.debug(`Refreshing resources view`);
    const resources = await this.repository.listResources();
    this.resourcesViewProvider.postMessage({
      type: ValuesUpdated,
      data: resources,
    } satisfies ValuesUpdatedEvent);
  }

  private async handleMessage(message: unknown): Promise<void> {
    if (isEventMessage(message)) {
      const event = message as ViewEvent;
      switch (event.type) {
        case ViewReady: {
          await this.refresh();
          break;
        }
        case CollapsibleStateChanged: {
          vscode.commands.executeCommand('setContext', 'bevyInspector.anyResourceExpanded', event.data.anyExpanded);
          break;
        }
        case UpdateRequested: {
          const updated = await this.setResourceValue(event);
          if (updated) {
            this.refresh();
          }
          break;
        }
        // Ignore others.
      }
    }
  }

  private expandAll(): void {
    this.resourcesViewProvider.postMessage({
      type: SetCollapsibleState,
      data: { anyExpanded: true },
    });
  }

  private collapseAll(): void {
    this.resourcesViewProvider.postMessage({
      type: SetCollapsibleState,
      data: { anyExpanded: false },
    });
  }

  private async setResourceValue(event: UpdateRequestedEvent): Promise<boolean> {
    try {
      await this.repository.setResourceValue(event.data.typePath, event.data.path, event.data.newValue);
      return true;
    } catch (error: unknown) {
      const message = (error as Error).message;
      vscode.window.showErrorMessage(`Error setting resource value: ${message}`);
      return false;
    }
  }

  private async insertResource(): Promise<void> {
    const typePath = await this.promptForTypePath();
    if (typePath) {
      const jsonValue = await vscode.window.showInputBox({
        prompt: 'Enter the resource value in JSON format',
        placeHolder: '{"key": "value"}',
        ignoreFocusOut: true,
      });
      if (jsonValue) {
        try {
          const value = JSON.parse(jsonValue);
          await this.repository.insertResource(typePath, value);
          this.refresh();
        } catch (error: unknown) {
          vscode.window.showErrorMessage(`Error inserting resource: ${(error as Error).message}`);
        }
      }
    }
  }

  private async promptForTypePath(): Promise<TypePath | undefined> {
    try {
      const items = await this.repository.listTypePaths();
      return await vscode.window.showQuickPick(items, {
        title: 'Enter the resource type to insert',
        ignoreFocusOut: true,
        canPickMany: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return await vscode.window.showInputBox({
        title: 'Enter the resource type to insert',
        placeHolder: 'bevy_core::name::Name or bevy_transform::components::transform::Transform',
        ignoreFocusOut: true,
      });
    }
  }
}
