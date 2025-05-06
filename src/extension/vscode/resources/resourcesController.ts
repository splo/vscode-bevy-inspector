import * as vscode from 'vscode';
import type { InspectorRepository } from '../../inspectorRepository';
import { ResourcesViewProvider } from './resourcesViewProvider';

export class ResourcesController {
  private resourcesViewProvider: ResourcesViewProvider;
  public readonly onValueUpdated: vscode.Event<void>;

  constructor(context: vscode.ExtensionContext, inspectorRepository: InspectorRepository) {
    this.resourcesViewProvider = new ResourcesViewProvider(inspectorRepository, context.extensionUri);
    this.onValueUpdated = this.resourcesViewProvider.valueUpdatedEmitter.event;
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('bevyInspector.resources', this.resourcesViewProvider),
    );
  }
}
