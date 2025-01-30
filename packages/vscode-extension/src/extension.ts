import levenshtein from 'fast-levenshtein';
import * as vscode from 'vscode';
import { BevyTreeDataProvider } from './bevyTreeDataProvider';
import { BevyTreeService, Component, Entity } from './bevyViewService';
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

  constructor(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('bevyInspector');
    const url = config.get('url', JsonRpcBevyRemoteService.DEFAULT_URL);
    const bevyVersion = config.get('bevyVersion', BevyTreeService.DEFAULT_BEVY_VERSION);
    this.remoteService = new JsonRpcBevyRemoteService(url);
    this.treeService = new BevyTreeService(this.remoteService);
    this.treeService.bevyVersion = bevyVersion;
    this.treeDataProvider = new BevyTreeDataProvider(this.treeService);
    this.polling = new PollingService();

    vscode.window.createTreeView('bevyInspector', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
    });
    context.subscriptions.push(
      vscode.commands.registerCommand('bevyInspector.refresh', () => this.refresh()),
      vscode.commands.registerCommand('bevyInspector.enablePolling', () => this.enablePolling()),
      vscode.commands.registerCommand('bevyInspector.disablePolling', () => this.disablePolling()),
      vscode.commands.registerCommand('bevyInspector.destroyEntity', (arg: any) => this.destroyEntity(arg)),
      vscode.commands.registerCommand('bevyInspector.copyComponentName', (arg: any) => this.copyComponentName(arg)),
      vscode.commands.registerCommand('bevyInspector.goToDefinition', (arg: any) => this.goToDefinition(arg)),
    );

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

  private async refresh() {
    this.treeDataProvider.refresh();
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
