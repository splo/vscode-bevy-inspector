import type { SetComponentValueResponseData } from '@bevy-inspector/inspector-data/messages';
import {
  SetComponentValue,
  type InspectorRequest,
  type SelectionChangedEvent,
} from '@bevy-inspector/inspector-data/messages';
import type { ResponseMessage } from '@bevy-inspector/messenger/types';
import fs from 'fs';
import * as vscode from 'vscode';
import type { InspectorRepository } from '../../inspectorRepository';
import type { BevyError } from '../../brp/brp';
import { TypeSchemaService } from '../../brp/typeSchemaService';
import type { SelectionChange } from '../selectionChange';

export class SelectionViewProvider implements vscode.WebviewViewProvider {
  webview: vscode.Webview | undefined;
  repository: InspectorRepository;
  extensionUri: vscode.Uri;

  constructor(repository: InspectorRepository, extensionUri: vscode.Uri) {
    this.repository = repository;
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.webview = webviewView.webview;
    this.webview.options = {
      enableScripts: true,
    };
    const html = fs.readFileSync(
      webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'selection-view', 'index.html'))
        .fsPath,
      'utf-8',
    );
    const updatedHtml = html.replace(/(src|href)=["']([^"']*)["']/g, (_match: string, attr: string, path: string) => {
      if (path.startsWith('data:')) {
        return `${attr}="${path}"`;
      }
      const newUri = webviewView.webview.asWebviewUri(
        vscode.Uri.joinPath(this.extensionUri, 'dist', 'selection-view', path),
      );
      return `${attr}="${newUri}"`;
    });
    this.webview.html = updatedHtml;
    this.webview.onDidReceiveMessage(async (request: InspectorRequest) => {
      switch (request.type) {
        case SetComponentValue:
          {
            await this.repository.setComponentValue(
              request.data.entityId,
              request.data.typePath,
              request.data.newValue,
            );
            const response: ResponseMessage<SetComponentValueResponseData> = {
              requestId: request.id,
              data: { success: true },
            };
            webviewView.webview.postMessage(response);
          }
          break;
        default:
          console.warn(`Unknown message type: ${request.type}`);
          break;
      }
    });
  }

  public async updateSelection(selection: SelectionChange) {
    if (this.webview) {
      switch (selection.type) {
        case 'NonInspectable':
          this.webview.postMessage({
            type: 'SelectionChanged',
            data: { type: selection.type },
          } satisfies SelectionChangedEvent);
          break;
        case 'Resource':
          try {
            const resource = await this.repository.getResource(selection.typePath);
            this.webview.postMessage({
              type: 'SelectionChanged',
              data: { type: selection.type, resource },
            } satisfies SelectionChangedEvent);
          } catch (error: unknown) {
            this.webview.postMessage({
              type: 'SelectionChanged',
              data: {
                type: selection.type,
                resource: {
                  value: undefined,
                  error: (error as BevyError)?.message ?? 'Error getting resource: ${error}',
                  schema: {
                    typePath: selection.typePath,
                    shortPath: TypeSchemaService.shortenName(selection.typePath),
                  },
                },
              },
            } satisfies SelectionChangedEvent);
          }

          break;
        case 'Entity':
          try {
            const entity = await this.repository.getEntity(selection.entityId);
            this.webview.postMessage({
              type: 'SelectionChanged',
              data: { type: selection.type, entity },
            } satisfies SelectionChangedEvent);
          } catch (error: unknown) {
            this.webview.postMessage({
              type: 'SelectionChanged',
              data: {
                type: selection.type,
                entity: {
                  id: selection.entityId,
                  components: [
                    {
                      value: undefined,
                      error: (error as BevyError)?.message ?? 'Error getting entity: ${error}',
                      schema: {},
                    },
                  ],
                },
              },
            } satisfies SelectionChangedEvent);
          }
          break;
        default:
          break;
      }
    }
  }
}
