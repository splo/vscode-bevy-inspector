import levenshtein from 'fast-levenshtein';
import * as vscode from 'vscode';
import { BevyTreeDataProvider } from './bevyTreeDataProvider';
import { BevyTreeService, Component, DEFAULT_BEVY_VERSION, Entity } from './bevyViewService';
import { JsonRpcBevyRemoteService } from './jsonRpcBrp';
import { PollingService } from './polling';

const DEFAULT_URL = 'http://127.0.0.1:15702';

export function activate(context: vscode.ExtensionContext) {
	const url = vscode.workspace.getConfiguration('bevyInspector').get('url', DEFAULT_URL);
	const remoteService = new JsonRpcBevyRemoteService(url);
	const treeService = new BevyTreeService(remoteService);
	const treeDataProvider = new BevyTreeDataProvider(treeService);
	vscode.window.createTreeView('bevyInspector', {
		treeDataProvider,
		showCollapseAll: true,
	});
	const polling = new PollingService();
	vscode.commands.registerCommand('bevyInspector.refresh', () => treeDataProvider.refresh());
	vscode.commands.registerCommand('bevyInspector.enablePolling', () => polling.enablePolling());
	vscode.commands.registerCommand('bevyInspector.disablePolling', () => polling.disablePolling());
	vscode.commands.registerCommand('bevyInspector.destroyEntity', (entity: Entity) => treeDataProvider.destroyEntity(entity));
	vscode.commands.registerCommand('bevyInspector.copyComponentName', async (component: Component) => {
		if (component?.name) {
			await vscode.env.clipboard.writeText(component.name);
		}
	});
	vscode.commands.registerCommand('bevyInspector.goToDefinition', goToDefinition);
	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('bevyInspector.url')) {
			remoteService.url = vscode.workspace.getConfiguration('bevyInspector').get('url', DEFAULT_URL);
		}
		if (e.affectsConfiguration('bevyInspector.bevyVersion')) {
			treeService.bevyVersion = vscode.workspace.getConfiguration('bevyInspector').get('bevyVersion', DEFAULT_BEVY_VERSION);
			treeDataProvider.refresh();
		}
		if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
			polling.restart();
		}
	});
}

async function goToDefinition(component: Component) {
	if (!component?.name) {
		vscode.window.showWarningMessage('No selected component.');
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

async function findSymbolLocation(componentName: string): Promise<vscode.Location | null> {
	const query = (componentName.match(/(?:\w+::)*(\w+)/) || [])[1];
	if (query) {
		const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeWorkspaceSymbolProvider', query);
		if (symbols && symbols.length > 0) {
			console.debug(`Found symbols for query "${query}": "${symbols.map(symbol => symbol.name)}".`);
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
