import * as vscode from 'vscode';
import { JsonRpcBevyRemoteService } from '../brp/http/jsonRpcBrp';
import { RemoteInspectorRepository } from '../brp/remoteInspectorRepository';
import { TypeSchemaService } from '../brp/typeSchemaService';
import { CachedInspectorRepository } from '../cache/cachedInspectorRepository';
import { SelectionController } from './selection/selectionController';
import { TreeController } from './tree/treeController';

export class BevyInspectorExtension {
  constructor(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('bevyInspector');
    const url = config.get('url', JsonRpcBevyRemoteService.DEFAULT_URL);

    const remoteService = new JsonRpcBevyRemoteService(url);
    const cachedRepository = new CachedInspectorRepository(
      new RemoteInspectorRepository(remoteService, new TypeSchemaService()),
    );
    const treeController = new TreeController(context, cachedRepository);
    const selectionController = new SelectionController(context, cachedRepository);

    treeController.onSelectionChanged(async (selection) => await selectionController.updateSelection(selection));
    selectionController.onValueUpdated(() => treeController.refresh());

    vscode.workspace.onDidChangeConfiguration((e) => {
      const config = vscode.workspace.getConfiguration('bevyInspector');
      if (e.affectsConfiguration('bevyInspector.url')) {
        remoteService.url = config.get('url', JsonRpcBevyRemoteService.DEFAULT_URL);
      }
      if (e.affectsConfiguration('bevyInspector.bevyVersion')) {
        // this.treeService.bevyVersion = config.get('bevyVersion', BevyTreeService.DEFAULT_BEVY_VERSION);
        treeController.refresh();
      }
    });
  }
}
