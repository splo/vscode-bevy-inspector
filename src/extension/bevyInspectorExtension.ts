import * as vscode from 'vscode';
import { V0_15BevyRemoteService } from '../brp/http/v0_15BevyRemoteService';
import { V0_16BevyRemoteService } from '../brp/http/v0_16BevyRemoteService';
import { V0_17BevyRemoteService } from '../brp/http/v0_17BevyRemoteService';
import type { BrpAdapter } from './brp/adapter';
import { V0_15BrpAdapter } from './brp/v0_15BrpAdapter';
import { V0_16BrpAdapter } from './brp/v0_16BrpAdapter';
import { V0_17BrpAdapter } from './brp/v0_17BrpAdapter';
import { V0_18BrpAdapter } from './brp/v0_18BrpAdapter';
import { ComponentRepository } from './components/componentRepository';
import { ComponentsController } from './components/componentsController';
import { TreeController } from './entities/entitiesController';
import { EntityTreeRepository } from './entities/entityTreeRepository';
import { ResourceRepository } from './resources/resourceRepository';
import { ResourcesController } from './resources/resourcesController';
import { ReflectionSchemaService } from './schemas/reflectionSchemaService';
import { RegistryController } from './schemas/registryController';
import { RegistryRepository } from './schemas/registryRepository';
import { RemoteSchemaService } from './schemas/remoteSchemaService';
import type { SchemaService } from './schemas/schemas';
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
        this.setupBevy(this.buildBrpAdapter(server), context);
        logger.info(`Connected to server v${server.version} (${server.url})`);
      } else {
        this.disposables.forEach((d) => d.dispose());
        logger.info(`Disconnected from server v${server.version} (${server.url})`);
      }
    });
    logger.info('Bevy Inspector extension started');
  }

  private buildBrpAdapter(server: Server): BrpAdapter {
    // Bevy 0.15.x doesn't report its version.
    switch ((server.version ?? '0.15.x').substring(0, 4)) {
      case '0.15': {
        return new V0_15BrpAdapter(new V0_15BevyRemoteService(server.url, logger.debug));
      }
      case '0.16': {
        return new V0_16BrpAdapter(new V0_16BevyRemoteService(server.url, logger.debug));
      }
      case '0.17': {
        return new V0_17BrpAdapter(new V0_17BevyRemoteService(server.url, logger.debug));
      }
      case '0.18': {
        return new V0_18BrpAdapter(server.url, logger.debug);
      }
      default: {
        vscode.window.showWarningMessage(`Unsupported Bevy version: "${server.version}".`);
        // Still try to connect using the latest protocol.
        return new V0_18BrpAdapter(server.url, logger.debug);
      }
    }
  }

  private setupBevy(brp: BrpAdapter, context: vscode.ExtensionContext) {
    try {
      vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', !brp.supportsResources);
      vscode.commands.executeCommand('setContext', 'bevyInspector.registryUnsupported', !brp.supportsRegistry);
      let schemaService: SchemaService;
      if (brp.supportsRegistry) {
        schemaService = new RemoteSchemaService(brp);
      } else {
        schemaService = new ReflectionSchemaService();
      }
      const treeController = new TreeController(context, new EntityTreeRepository(brp));
      const componentsController = new ComponentsController(context, new ComponentRepository(brp, schemaService));
      treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController));
      componentsController.onValueUpdated((entityUpdated) => treeController.refreshName(entityUpdated));
      this.disposables.push(treeController, componentsController);
      if (brp.supportsResources) {
        const resourcesController = new ResourcesController(context, new ResourceRepository(brp, schemaService));
        this.disposables.push(resourcesController);
      }
      if (brp.supportsRegistry) {
        const registryController = new RegistryController(context, new RegistryRepository(brp));
        this.disposables.push(registryController);
      }
    } catch (error: unknown) {
      logger.error('Failed to setup for Bevy ', brp.bevyVersion, error);
    }
  }
}
