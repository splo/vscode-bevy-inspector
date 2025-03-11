import {
  EntitySelectedData,
  GetSchemaResponseData,
  InspectorMessage,
  InspectorRequest,
  ListComponentsResponseData,
  SetComponentValueResponseData,
} from '@bevy-inspector/inspector-messages';
import type { ResponseMessage } from '@bevy-inspector/messenger/types';
import levenshtein from 'fast-levenshtein';
import fs from 'fs';
import type { JSONSchema7 } from 'json-schema';
import * as vscode from 'vscode';
import { BevyTreeDataProvider } from './bevyTreeDataProvider';
import type { Component } from './bevyViewService';
import { BevyTreeService, Entity } from './bevyViewService';
import { JsonRpcBevyRemoteService } from './jsonRpcBrp';
import { PollingService } from './polling';

export function activate(context: vscode.ExtensionContext) {
  new BevyInspectorExtension(context);
}

class BevyInspectorExtension {
  private remoteService: JsonRpcBevyRemoteService;
  private treeService: BevyTreeService;
  private treeDataProvider: BevyTreeDataProvider;
  private polling: PollingService;
  private detailsView?: vscode.Webview;
  private selectedEntities?: Entity[];

  constructor(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('bevyInspector');
    const url = config.get('url', JsonRpcBevyRemoteService.DEFAULT_URL);
    const bevyVersion = config.get('bevyVersion', BevyTreeService.DEFAULT_BEVY_VERSION);
    this.remoteService = new JsonRpcBevyRemoteService(url);
    this.treeService = new BevyTreeService(this.remoteService);
    this.treeService.bevyVersion = bevyVersion;
    this.treeDataProvider = new BevyTreeDataProvider(this.treeService);
    this.polling = new PollingService();

    const treeView = vscode.window.createTreeView('bevyInspector', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: true,
    });
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refresh', () => this.refresh()),
      vscode.commands.registerCommand('bevyInspector.enablePolling', () => this.enablePolling()),
      vscode.commands.registerCommand('bevyInspector.disablePolling', () => this.disablePolling()),
      vscode.commands.registerCommand('bevyInspector.destroyEntity', (arg: unknown) =>
        this.destroyEntity(arg as Entity),
      ),
      vscode.commands.registerCommand('bevyInspector.copyComponentName', (arg: unknown) =>
        this.copyComponentName(arg as Component),
      ),
      vscode.commands.registerCommand('bevyInspector.copyComponentValue', (arg: unknown) =>
        this.copyComponentValue(arg as Component),
      ),
      vscode.commands.registerCommand('bevyInspector.goToDefinition', (arg: unknown) =>
        this.goToDefinition(arg as Component),
      ),
    );

    vscode.window.registerWebviewViewProvider('bevyDetails', {
      resolveWebviewView: (webviewView) => {
        this.detailsView = webviewView.webview;
        webviewView.webview.options = {
          enableScripts: true,
        };
        const html = fs.readFileSync(
          webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'dist', 'selection-view', 'index.html'),
          ).fsPath,
          'utf-8',
        );
        const updatedHtml = html.replace(/(src|href)=["']([^"']*)["']/g, (_match, attr, path) => {
          if (path.startsWith('data:')) {
            return `${attr}="${path}"`;
          }
          const newUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(context.extensionUri, 'dist', 'selection-view', path),
          );
          return `${attr}="${newUri}"`;
        });
        webviewView.webview.html = updatedHtml;
        this.detailsView.onDidReceiveMessage((request: InspectorRequest) => {
          console.debug('Extension received request:', request);
          switch (request.type) {
            case InspectorMessage.ListComponents: {
              this.treeService.listComponents(request.data.entityId).then((components) => {
                const response: ResponseMessage<ListComponentsResponseData> = {
                  requestId: request.id,
                  data: {
                    components: components.map((component) => ({
                      typePath: component.name,
                      shortPath: shortenName(component.name),
                      value: component.value,
                      error: component.errorMessage,
                    })),
                  },
                };
                this.detailsView?.postMessage(response);
              });
              break;
            }
            case InspectorMessage.GetSchema: {
              this.treeService.getRegistrySchemas().then((schema) => {
                const response: ResponseMessage<GetSchemaResponseData> = {
                  requestId: request.id,
                  data: { schema: schema.$defs![request.data.componentTypePath] as JSONSchema7 },
                };
                this.detailsView?.postMessage(response);
              });
              break;
            }
            case InspectorMessage.SetComponentValue: {
              const { entityId, typePath, newValue } = request.data;
              this.treeService.updateComponent(entityId, typePath, newValue).then(() => {
                const response: SetComponentValueResponseData = {
                  success: true,
                };
                this.detailsView?.postMessage(response);
              });
              break;
            }
            default:
              console.warn(`Received an unexpected message from webview:`, request);
          }
        });
      },
    });
    treeView.onDidChangeSelection(async (selectionChanged) => {
      this.selectedEntities = [];
      if (selectionChanged.selection instanceof Entity) {
        this.selectedEntities.push(selectionChanged.selection);
      } else if (
        Array.isArray(selectionChanged.selection) &&
        selectionChanged.selection.every((item) => item instanceof Entity)
      ) {
        this.selectedEntities.push(...selectionChanged.selection);
      }
      await this.refreshDetailsView(this.selectedEntities);
    });

    vscode.workspace.onDidChangeConfiguration((e) => {
      const config = vscode.workspace.getConfiguration('bevyInspector');
      if (e.affectsConfiguration('bevyInspector.url')) {
        this.remoteService.url = config.get('url', JsonRpcBevyRemoteService.DEFAULT_URL);
      }
      if (e.affectsConfiguration('bevyInspector.bevyVersion')) {
        this.treeService.bevyVersion = config.get('bevyVersion', BevyTreeService.DEFAULT_BEVY_VERSION);
        this.treeDataProvider.refresh();
      }
      if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
        this.polling.restart();
      }
    });
  }

  private async refreshDetailsView(selectedEntities?: Entity[]) {
    const entities = await Promise.all(
      (selectedEntities || []).map(async (entity) => {
        const components = await this.treeService.listComponents(entity.id);
        return {
          id: entity.id,
          name: entity.name || entity.id.toString(),
          components: components.map((c: Component) => ({
            name: c.name,
            value: c.value,
          })),
        };
      }),
    );
    const data: EntitySelectedData = { entity: entities[0] };
    this.detailsView!.postMessage({ type: InspectorMessage.EntitySelected, data });
  }

  private async refresh() {
    this.treeDataProvider.refresh();
    await this.refreshDetailsView(this.selectedEntities);
  }

  private async enablePolling() {
    this.polling.enablePolling();
  }

  private async disablePolling() {
    this.polling.disablePolling();
  }

  private async destroyEntity(entity: Entity) {
    if (entity?.id) {
      await this.treeDataProvider.destroyEntity(entity);
    }
  }

  private async copyComponentName(component: Component) {
    if (component?.name) {
      await vscode.env.clipboard.writeText(component.name);
    }
  }

  private async copyComponentValue(component: Component) {
    if (component?.value) {
      await vscode.env.clipboard.writeText(JSON.stringify(component.value, null, 2));
    }
  }

  private async goToDefinition(component: Component) {
    if (!component?.name) {
      await vscode.window.showWarningMessage('No selected component.');
      return;
    }
    const location = await findSymbolLocation(component.name);
    if (location && location.uri) {
      const document = await vscode.workspace.openTextDocument(location.uri);
      const editor = await vscode.window.showTextDocument(document);
      editor.revealRange(location.range, vscode.TextEditorRevealType.InCenter);
      editor.selection = new vscode.Selection(location.range.start, location.range.start);
    } else {
      await vscode.window.showInformationMessage(`No symbol found in workspace for component "${component.name}".`);
    }
  }
}

async function findSymbolLocation(componentName: string): Promise<vscode.Location | null> {
  const query = (componentName.match(/(?:\w+::)*(\w+)/) || [])[1];
  if (query) {
    const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
      'vscode.executeWorkspaceSymbolProvider',
      query,
    );
    if (symbols && symbols.length > 0) {
      console.debug(`Found symbols for query "${query}": "${symbols.map((symbol) => symbol.name)}".`);
      const firstSymbol = symbols.reduce((previous, current) => {
        const prevDistance = levenshtein.get(query, previous.name);
        const currDistance = levenshtein.get(query, current.name);
        return currDistance < prevDistance ? current : previous;
      }, symbols[0]);
      console.debug(`Found symbol for query "${query}": "${JSON.stringify(firstSymbol)}".`);
      return firstSymbol.location;
    }
  }
  return null;
}

function shortenName(name: string): string {
  return name.replaceAll(/\w*::/g, '');
}
