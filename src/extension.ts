import * as vscode from 'vscode';
import { BevyTreeDataProvider } from './bevyTreeDataProvider';
import { BevyTreeService, Entity } from './bevyViewService';
import { JsonRpcBevyRemoteService } from './jsonRpcBrp';
import { PollingService } from './polling';

const DEFAULT_URL = 'http://127.0.0.1:15702';

export function activate(context: vscode.ExtensionContext) {
	const url = vscode.workspace.getConfiguration('bevyInspector').get('url', DEFAULT_URL);
	const remoteService = new JsonRpcBevyRemoteService(url);
	const treeDataProvider = new BevyTreeDataProvider(new BevyTreeService(remoteService));
	vscode.window.createTreeView('bevyInspector', {
		treeDataProvider,
		showCollapseAll: true,
	});
	const polling = new PollingService();
	vscode.commands.registerCommand('bevyInspector.refresh', () => treeDataProvider.refresh());
	vscode.commands.registerCommand('bevyInspector.enablePolling', () => polling.enablePolling());
	vscode.commands.registerCommand('bevyInspector.disablePolling', () => polling.disablePolling());
	vscode.commands.registerCommand('bevyInspector.destroyEntity', (entity: Entity) => treeDataProvider.destroyEntity(entity));
	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('bevyInspector.url')) {
			remoteService.url = vscode.workspace.getConfiguration('bevyInspector').get('url', DEFAULT_URL);
		}
		if (e.affectsConfiguration('bevyInspector.pollingDelay')) {
			polling.restart();
		}
	});
}
