import * as vscode from 'vscode';
import type { UpdateRequestedEvent, ValuesUpdatedEvent, ViewEvent } from '../../../inspector-data/messages';
import { UpdateRequested, ValuesUpdated, ViewReady } from '../../../inspector-data/messages';
import { isEventMessage } from '../../../messages/types';
import type { ResourceRepository } from './resources';
import { ResourcesViewProvider } from './resourcesViewProvider';

export class ResourcesController {
  private repository: ResourceRepository;
  private resourcesViewProvider: ResourcesViewProvider;

  constructor(context: vscode.ExtensionContext, repository: ResourceRepository) {
    this.repository = repository;
    this.resourcesViewProvider = new ResourcesViewProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('bevyInspector.resources', this.resourcesViewProvider),
    );
    this.resourcesViewProvider.onMessageReceived(this.handleMessage.bind(this));
  }

  private async handleMessage(message: unknown): Promise<void> {
    if (isEventMessage(message)) {
      const event = message as ViewEvent;
      switch (event.type) {
        case ViewReady: {
          await this.refreshView();
          break;
        }
        case UpdateRequested: {
          const updated = await this.setResourceValue(event);
          if (updated) {
            this.refreshView();
          }
          break;
        }
        // Ignore others.
      }
    }
  }

  private async refreshView() {
    const resources = await this.repository.listResources();
    this.resourcesViewProvider.postMessage({
      type: ValuesUpdated,
      data: resources,
    } satisfies ValuesUpdatedEvent);
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
}
