import * as vscode from 'vscode';
import { V0_15BevyRemoteService } from '../brp/http/v0_15JsonRpcBrp';
import { V0_16BevyRemoteService } from '../brp/http/v0_16JsonRpcBrp';
import { TypeSchemaService } from '../brp/typeSchemaService';
import { ComponentsController } from './components/componentsController';
import { V0_15ComponentRepository } from './components/v0_15ComponentRepository';
import { V0_16ComponentRepository } from './components/v0_16ComponentRepository';
import { TreeController } from './entities/entitiesController';
import { V0_15EntityTreeRepository } from './entities/v0_15EntityTreeRepository';
import { V0_16EntityTreeRepository } from './entities/v0_16EntityTreeRepository';
import { ResourcesController } from './resources/resourcesController';
import { V0_16ResourceRepository } from './resources/v0_16ResourceRepository';
import type { Server } from './servers/server';
import { ServerController } from './servers/serverController';
import { VscodeStateServerRepository } from './servers/vscodeStateServerRepository';

export class BevyInspectorExtension {
  constructor(context: vscode.ExtensionContext) {
    const serverRepository = new VscodeStateServerRepository(context.globalState);
    const serverController = new ServerController(context, serverRepository);
    serverController.onServerConnected((server: Server) => {
      switch ((server.version ?? '0.15.x').substring(0, 4)) {
        case '0.15': {
          vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', true);
          const brp = new V0_15BevyRemoteService(server.url);
          const treeController = new TreeController(context, new V0_15EntityTreeRepository(brp));
          const componentsController = new ComponentsController(context, new V0_15ComponentRepository(brp));
          treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController));
          componentsController.onValueUpdated(() => treeController.refresh());
          break;
        }
        default:
          vscode.window.showErrorMessage(`Unsupported Bevy version: ${server.version}.`);
        // Falls through: try using latest version.
        case '0.16': {
          vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', false);
          const brp = new V0_16BevyRemoteService(server.url);
          const typeSchemaService = new TypeSchemaService();
          const treeController = new TreeController(context, new V0_16EntityTreeRepository(brp));
          const componentsController = new ComponentsController(
            context,
            new V0_16ComponentRepository(brp, typeSchemaService),
          );
          new ResourcesController(context, new V0_16ResourceRepository(brp, typeSchemaService));
          treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController));
          componentsController.onValueUpdated((entityUpdated) => treeController.refreshNames(entityUpdated));
          break;
        }
      }
    });
  }
}
