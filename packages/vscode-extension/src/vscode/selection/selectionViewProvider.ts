import type {
  SelectionChangedData,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
  SetResourceValueRequestData,
  SetResourceValueResponseData,
} from '@bevy-inspector/inspector-data/messages';
import {
  SetComponentValue,
  SetResourceValue,
  type InspectorRequest,
  type SelectionChangedEvent,
} from '@bevy-inspector/inspector-data/messages';
import type { EntityId, TypePath } from '@bevy-inspector/inspector-data/types';
import type { RequestMessage, ResponseMessage } from '@bevy-inspector/messenger/types';
import fs from 'fs';
import * as vscode from 'vscode';
import type { BevyError } from '../../brp/brp';
import { TypeSchemaService } from '../../brp/typeSchemaService';
import type { InspectorRepository } from '../../inspectorRepository';
import type { SelectionChange } from '../selectionChange';

export class SelectionViewProvider implements vscode.WebviewViewProvider {
  webview: vscode.Webview | undefined;
  repository: InspectorRepository;
  extensionUri: vscode.Uri;
  readonly valueUpdatedEmitter = new vscode.EventEmitter<void>();

  constructor(repository: InspectorRepository, extensionUri: vscode.Uri) {
    this.repository = repository;
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.webview = webviewView.webview;
    this.webview.options = {
      enableScripts: true,
    };
    const rawHtml = fs.readFileSync(
      webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'selection-view', 'index.html'))
        .fsPath,
      'utf-8',
    );
    const updatedHtml = rawHtml.replace(
      /(src|href)=["']([^"']*)["']/g,
      (_match: string, attr: string, path: string) => {
        if (path.startsWith('data:')) {
          return `${attr}="${path}"`;
        }
        const newUri = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(this.extensionUri, 'dist', 'selection-view', path),
        );
        return `${attr}="${newUri}"`;
      },
    );
    this.webview.html = updatedHtml;
    this.webview.onDidReceiveMessage(async (message: unknown) => {
      if (message && typeof message === 'object' && 'type' in message) {
        const request: InspectorRequest = message as InspectorRequest;
        switch (request.type) {
          case SetComponentValue:
            this.webview!.postMessage(await this.setComponentValue(request));
            break;
          case SetResourceValue:
            this.webview!.postMessage(await this.setResourceValue(request));
            break;
          default:
            console.warn(`Unknown message type: ${JSON.stringify(message)}`);
            break;
        }
      }
    });
  }

  public async updateSelection(selection: SelectionChange) {
    if (this.webview) {
      this.webview.postMessage(await this.onSelectionChanged(selection));
    }
  }

  private async setComponentValue(
    request: RequestMessage<SetComponentValueRequestData>,
  ): Promise<ResponseMessage<SetComponentValueResponseData>> {
    try {
      await this.repository.setComponentValue(request.data.entityId, request.data.typePath, request.data.newValue);
      this.valueUpdatedEmitter.fire();
      return {
        requestId: request.id,
        data: {
          success: true,
        },
      };
    } catch (error: unknown) {
      return {
        requestId: request.id,
        data: {
          success: false,
          error: (error as Error).message,
        },
      };
    }
  }

  private async setResourceValue(
    request: RequestMessage<SetResourceValueRequestData>,
  ): Promise<ResponseMessage<SetResourceValueResponseData>> {
    try {
      await this.repository.setResourceValue(request.data.typePath, request.data.newValue);
      this.valueUpdatedEmitter.fire();
      return {
        requestId: request.id,
        data: {
          success: true,
        },
      };
    } catch (error: unknown) {
      return {
        requestId: request.id,
        data: {
          success: false,
          error: (error as Error).message,
        },
      };
    }
  }

  private async onSelectionChanged(selection: SelectionChange): Promise<SelectionChangedEvent> {
    switch (selection.type) {
      case 'Resource':
        return {
          type: 'SelectionChanged',
          data: await this.getSelectedResource(selection.typePath),
        };
      case 'Entity':
        return {
          type: 'SelectionChanged',
          data: await this.getSelectedEntity(selection.entityId),
        };
      case 'NonInspectable':
      default:
        return {
          type: 'SelectionChanged',
          data: { type: selection.type },
        };
    }
  }

  private async getSelectedResource(typePath: TypePath): Promise<SelectionChangedData> {
    try {
      const resource = await this.repository.getResource(typePath);
      return { type: 'Resource', resource };
    } catch (error: unknown) {
      const resource = {
        value: undefined,
        error: (error as BevyError)?.message ?? `Error getting resource: ${error}`,
        schema: {
          typePath: typePath,
          shortPath: TypeSchemaService.shortenName(typePath),
        },
      };
      return { type: 'Resource', resource };
    }
  }

  private async getSelectedEntity(entityId: EntityId): Promise<SelectionChangedData> {
    try {
      const entity = await this.repository.getEntity(entityId);
      return { type: 'Entity', entity };
    } catch (error: unknown) {
      const entity = {
        id: entityId,
        components: [
          {
            value: undefined,
            error: (error as BevyError)?.message ?? `Error getting entity: ${error}`,
            schema: {},
          },
        ],
      };
      return { type: 'Entity', entity };
    }
  }
}
