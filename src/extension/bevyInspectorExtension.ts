import * as vscode from 'vscode';
import { V0_15BevyRemoteService } from '../brp/http/v0_15BevyRemoteService';
import { V0_16BevyRemoteService } from '../brp/http/v0_16BevyRemoteService';
import { V0_17BevyRemoteService } from '../brp/http/v0_17BevyRemoteService';
import { V0_18BevyRemoteService } from '../brp/http/v0_18BevyRemoteService';
import { V0_19BevyRemoteService } from '../brp/http/v0_19BevyRemoteService';
import type { BrpAdapter } from './brp/adapter';
import { V0_15BrpAdapter } from './brp/v0_15BrpAdapter';
import { V0_16BrpAdapter } from './brp/v0_16BrpAdapter';
import { V0_17BrpAdapter } from './brp/v0_17BrpAdapter';
import { V0_18BrpAdapter } from './brp/v0_18BrpAdapter';
import { V0_19BrpAdapter } from './brp/v0_19BrpAdapter';
import { V0_20BrpAdapter as LatestBrpAdapter } from './brp/v0_20BrpAdapter';
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

export class BevyInspectorExtension implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(this);
    const serverRepository = new VscodeStateServerRepository(context.globalState);
    const serverController = new ServerController(context, serverRepository);
    context.subscriptions.push(
      serverController.onConnectionChanged(({ server, connected }: ConnectionChange) => {
        if (connected) {
          this.setupBevy(this.buildBrpAdapter(server), context.extensionUri);
          logger.info(`Connected to server v${server.version} (${server.url})`);
        } else {
          this.disposeConnection();
          logger.info(`Disconnected from server v${server.version} (${server.url})`);
        }
      }),
    );
    logger.info('Bevy Inspector extension started');
  }

  dispose() {
    this.disposeConnection();
  }

  private disposeConnection() {
    this.disposables.splice(0).forEach((disposable) => disposable.dispose());
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
        return new V0_18BrpAdapter(new V0_18BevyRemoteService(server.url, logger.debug));
      }
      case '0.19': {
        return new V0_19BrpAdapter(new V0_19BevyRemoteService(server.url, logger.debug));
      }
      case '0.20': {
        return new LatestBrpAdapter(server.url, logger.debug);
      }
      default: {
        vscode.window.showWarningMessage(`Unsupported Bevy version: "${server.version}".`);
        // Still try to connect using the latest protocol.
        return new LatestBrpAdapter(server.url, logger.debug);
      }
    }
  }

  private setupBevy(brp: BrpAdapter, extensionDir: vscode.Uri) {
    try {
      vscode.commands.executeCommand('setContext', 'bevyInspector.resourcesUnsupported', !brp.supportsResources);
      vscode.commands.executeCommand('setContext', 'bevyInspector.registryUnsupported', !brp.supportsRegistry);
      let schemaService: SchemaService;
      if (brp.supportsRegistry) {
        schemaService = new RemoteSchemaService(brp);
      } else {
        schemaService = new ReflectionSchemaService();
      }
      const treeController = new TreeController(new EntityTreeRepository(brp));
      const componentsController = new ComponentsController(new ComponentRepository(brp, schemaService), extensionDir);
      this.disposables.push(
        treeController,
        componentsController,
        treeController.onSelectionChanged(componentsController.updateSelection.bind(componentsController)),
        componentsController.onValueUpdated((entityUpdated) => treeController.refreshName(entityUpdated)),
      );
      if (brp.supportsResources) {
        const resourcesController = new ResourcesController(new ResourceRepository(brp, schemaService), extensionDir);
        this.disposables.push(resourcesController);
      }
      if (brp.supportsRegistry) {
        const registryController = new RegistryController(new RegistryRepository(brp));
        this.disposables.push(registryController);
      }
    } catch (error: unknown) {
      logger.error('Failed to setup for Bevy ', brp.bevyVersion, error);
    }
  }
}
