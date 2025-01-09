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
