import fs from 'fs';
import * as vscode from 'vscode';
import type {
  EntitySelectedData,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
} from '../../../inspector-data/messages';
import { SetComponentValue, type InspectorRequest } from '../../../inspector-data/messages';
import type { Entity, EntityId } from '../../../inspector-data/types';
import type { RequestMessage, ResponseMessage } from '../../../messenger/types';
import type { BevyError } from '../../brp/brp';
import type { InspectorRepository } from '../../inspectorRepository';
import type { EntitySelection } from '../EntitySelection';

export class ComponentsViewProvider implements vscode.WebviewViewProvider {
  view: vscode.WebviewView | undefined;
  repository: InspectorRepository;
  viewPath: vscode.Uri;
  readonly valueUpdatedEmitter = new vscode.EventEmitter<void>();

  constructor(repository: InspectorRepository, extensionUri: vscode.Uri) {
    this.repository = repository;
    this.viewPath = vscode.Uri.joinPath(extensionUri, 'dist', 'components-view');
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    this.view.webview.options = {
      enableScripts: true,
    };
    const rawHtml = fs.readFileSync(
      webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.viewPath, 'index.html')).fsPath,
      'utf-8',
    );
    const updatedHtml = rawHtml.replace(
      /(src|href)=["']([^"']*)["']/g,
      (_match: string, attr: string, path: string) => {
        if (path.startsWith('data:')) {
          return `${attr}="${path}"`;
        }
        const newUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.viewPath, path));
        return `${attr}="${newUri}"`;
      },
    );
    this.view.webview.html = updatedHtml;
    this.view.webview.onDidReceiveMessage(async (message: unknown) => {
      if (message && typeof message === 'object' && 'type' in message) {
        const request: InspectorRequest = message as InspectorRequest;
        switch (request.type) {
          case SetComponentValue:
            this.view!.webview.postMessage(await this.setComponentValue(request));
            break;
          default:
            // Skip.
            break;
        }
      }
    });
  }

  public async updateSelection(selection: EntitySelection): Promise<void> {
    if (this.view) {
      const data = await this.getSelectedEntity(selection.entityId);
      this.view.title = `Components of ${data.entity.name ?? data.entity.id}`;
      this.view.show(true);
      this.view.webview.postMessage({
        type: 'EntitySelected',
        data,
      });
    }
  }

  private async setComponentValue(
    request: RequestMessage<SetComponentValueRequestData>,
  ): Promise<ResponseMessage<SetComponentValueResponseData>> {
    try {
      await this.repository.setComponentValue(
        request.data.entityId,
        request.data.typePath,
        request.data.path,
        request.data.newValue,
      );
      this.valueUpdatedEmitter.fire();
      return {
        requestId: request.id,
        data: {
          success: true,
        },
      };
    } catch (error: unknown) {
      const message = (error as Error).message;
      vscode.window.showErrorMessage(`Error setting component value: ${message}`);
      return {
        requestId: request.id,
        data: {
          success: false,
          error: message,
        },
      };
    }
  }

  private async getSelectedEntity(entityId: EntityId): Promise<EntitySelectedData> {
    try {
      const entity = await this.repository.getEntity(entityId);
      return { entity };
    } catch (error: unknown) {
      const entity: Entity = {
        id: entityId,
        components: [
          {
            value: undefined,
            error: (error as BevyError)?.message ?? `Error getting entity: ${error}`,
            schema: { shortPath: 'Unknown', typePath: 'Unknown' },
          },
        ],
      };
      return { entity };
    }
  }
}
