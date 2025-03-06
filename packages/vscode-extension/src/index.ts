import levenshtein from 'fast-levenshtein';
import fs from 'fs';
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
        this.detailsView.onDidReceiveMessage((e) => console.log('Event from webview:', e));
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
    // const schema = await this.treeService.getRegistrySchemas();
    const entities = await Promise.all(
      (selectedEntities || []).map(async (entity) => {
        const components = await this.treeService.listComponents(entity.id);
        return {
          name: entity.name || entity.id.toString(),
          components: components.map((c) => ({
            name: c.name,
            value: c.value,
          })),
        };
      }),
    );
    // const _data = { entities, schema };
    this.detailsView!.postMessage({ type: 'EntitySelected', data: entities[0] });
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
