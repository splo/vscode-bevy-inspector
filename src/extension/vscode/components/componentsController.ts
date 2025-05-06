import * as vscode from 'vscode';
import type { InspectorRepository } from '../../inspectorRepository';
import type { EntitySelection } from '../EntitySelection';
import { ComponentsViewProvider } from './componentsViewProvider';

export class ComponentsController {
  private componentsViewProvider: ComponentsViewProvider;
  public readonly onValueUpdated: vscode.Event<void>;

  constructor(context: vscode.ExtensionContext, inspectorRepository: InspectorRepository) {
    this.componentsViewProvider = new ComponentsViewProvider(inspectorRepository, context.extensionUri);
    this.onValueUpdated = this.componentsViewProvider.valueUpdatedEmitter.event;
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('bevyInspector.components', this.componentsViewProvider),
    );
  }

  public async updateSelection(selection: EntitySelection) {
    await this.componentsViewProvider.updateSelection(selection);
  }
}
