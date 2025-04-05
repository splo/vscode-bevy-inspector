import levenshtein from 'fast-levenshtein';
import * as vscode from 'vscode';
import type { TypePath } from '@bevy-inspector/inspector-data/types';
import type { InspectorRepository } from '../../../inspectorRepository';
import type { SelectionChange } from '../selectionChange';
import { SelectionViewProvider } from './selectionViewProvider';

export class SelectionController {
  private selectionViewProvider: SelectionViewProvider;

  constructor(context: vscode.ExtensionContext, inspectorRepository: InspectorRepository) {
    this.selectionViewProvider = new SelectionViewProvider(inspectorRepository, context.extensionUri);

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'bevyInspector.goToDefinition',
        async (typePath) => await goToDefinition(typePath),
      ),
      vscode.window.registerWebviewViewProvider('bevyInspector.selection', this.selectionViewProvider),
    );
  }

  public async updateSelection(selection: SelectionChange) {
    await this.selectionViewProvider.updateSelection(selection);
  }
}

async function goToDefinition(typePath?: TypePath) {
  if (!typePath) {
    await vscode.window.showWarningMessage('No selected type.');
    return;
  }
  const location = await findSymbolLocation(typePath);
  if (location && location.uri) {
    const document = await vscode.workspace.openTextDocument(location.uri);
    const editor = await vscode.window.showTextDocument(document);
    editor.revealRange(location.range, vscode.TextEditorRevealType.InCenter);
    editor.selection = new vscode.Selection(location.range.start, location.range.start);
  } else {
    await vscode.window.showInformationMessage(`No symbol found in workspace for type "${typePath}".`);
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
