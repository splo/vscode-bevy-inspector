import * as vscode from 'vscode';
import { V0_15BevyRemoteService } from '../brp/http/v0_15JsonRpcBrp';
import { V0_16BevyRemoteService } from '../brp/http/v0_16JsonRpcBrp';
import { V0_17BevyRemoteService } from '../brp/http/v0_17JsonRpcBrp';
import { ComponentsController } from './components/componentsController';
import { V0_15ComponentRepository } from './components/v0_15ComponentRepository';
import { V0_16ComponentRepository } from './components/v0_16ComponentRepository';
import { V0_17ComponentRepository } from './components/v0_17ComponentRepository';
import { TreeController } from './entities/entitiesController';
import { V0_15EntityTreeRepository } from './entities/v0_15EntityTreeRepository';
import { V0_16EntityTreeRepository } from './entities/v0_16EntityTreeRepository';
import { V0_17EntityTreeRepository } from './entities/v0_17EntityTreeRepository';
import { ResourcesController } from './resources/resourcesController';
import { V0_16ResourceRepository } from './resources/v0_16ResourceRepository';
import { V0_17ResourceRepository } from './resources/v0_17ResourceRepository';
import { BrpRegistryRepository } from './schemas/brpRegistryRepository';
import { ReflectionSchemaService } from './schemas/reflectionSchemaService';
import { RegistryController } from './schemas/registryController';
import { RemoteSchemaService } from './schemas/remoteSchemaService';
import type { ConnectionChange, Server } from './servers/server';
import { ServerController } from './servers/serverController';
import { VscodeStateServerRepository } from './servers/vscodeStateServerRepository';
import { logger } from './vscode/logger';

export class BevyInspectorExtension {
  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext) {
    const serverRepository = new VscodeStateServerRepository(context.globalState);
    const serverController = new ServerController(context, serverRepository);
    serverController.onConnectionChanged(({ server, connected }: ConnectionChange) => {
      if (connected) {
        switch ((server.version ?? '0.15.x').substring(0, 4)) {
          case '0.15': {
            this.setupBevy0_15(server, context);
            break;
          }
          case '0.16': {
            this.setupBevy0_16(server, context);
            break;
          }
          case '0.17': {
            this.setupBevy0_17(server, context);
            break;
          }
          default: {
            vscode.window.showWarningMessage(`Unsupported Bevy version: "${server.version}".`);
            // Still try to connect using the 0.17.x protocol.
            this.setupBevy0_17(server, context);
            break;
          }
        }
        logger.info(`Connected to server v${server.version} (${server.url})`);
      } else {
        this.disposables.forEach((d) => d.dispose());
        logger.info(`Disconnected from server v${server.version} (${server.url})`);
      }
    });
    logger.info('Bevy Inspector extension started');
  }

  private setupBevy0_15(server: Server, context: vscode.ExtensionContext) {
    try {
      vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', true);
      vscode.commands.executeCommand('setContext', 'bevyInspector.registryUnsupported', true);
      const brp = new V0_15BevyRemoteService(server.url, logger.debug);
      const schemaService = new ReflectionSchemaService();
      const treeController = new TreeController(context, new V0_15EntityTreeRepository(brp));
      const componentsController = new ComponentsController(context, new V0_15ComponentRepository(brp, schemaService));
      treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController));
      componentsController.onValueUpdated((entityUpdated) => treeController.refreshName(entityUpdated));
      this.disposables.push(treeController, componentsController);
    } catch (error: unknown) {
      logger.error('Failed to setup for Bevy 0.15', error);
    }
  }

  private setupBevy0_16(server: Server, context: vscode.ExtensionContext) {
    try {
      vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', false);
      vscode.commands.executeCommand('setContext', 'bevyInspector.registryUnsupported', false);
      const brp = new V0_16BevyRemoteService(server.url, logger.debug);
      const schemaService = new RemoteSchemaService(brp);
      const treeController = new TreeController(context, new V0_16EntityTreeRepository(brp));
      const componentsController = new ComponentsController(context, new V0_16ComponentRepository(brp, schemaService));
      const resourcesController = new ResourcesController(context, new V0_16ResourceRepository(brp, schemaService));
      const registryController = new RegistryController(context, new BrpRegistryRepository(brp));
      treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController));
      componentsController.onValueUpdated((entityUpdated) => treeController.refreshName(entityUpdated));
      this.disposables.push(treeController, componentsController, resourcesController, registryController);
    } catch (error: unknown) {
      logger.error('Failed to setup for Bevy 0.16', error);
    }
  }

  private setupBevy0_17(server: Server, context: vscode.ExtensionContext) {
    try {
      vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', false);
      vscode.commands.executeCommand('setContext', 'bevyInspector.registryUnsupported', false);
      const brp = new V0_17BevyRemoteService(server.url, logger.debug);
      const schemaService = new RemoteSchemaService(brp);
      const treeController = new TreeController(context, new V0_17EntityTreeRepository(brp));
      const componentsController = new ComponentsController(context, new V0_17ComponentRepository(brp, schemaService));
      const resourcesController = new ResourcesController(context, new V0_17ResourceRepository(brp, schemaService));
      const registryController = new RegistryController(context, new BrpRegistryRepository(brp));
      treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController));
      componentsController.onValueUpdated((entityUpdated) => treeController.refreshName(entityUpdated));
      this.disposables.push(treeController, componentsController, resourcesController, registryController);
    } catch (error: unknown) {
      logger.error('Failed to setup for Bevy 0.17', error);
    }
  }

}
