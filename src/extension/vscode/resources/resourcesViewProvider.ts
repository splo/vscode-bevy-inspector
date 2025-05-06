import fs from 'fs';
import * as vscode from 'vscode';
import type {
  ResourcesUpdatedEvent,
  SetResourceValueRequestData,
  SetResourceValueResponseData,
} from '../../../inspector-data/messages';
import { SetResourceValue, type InspectorRequest } from '../../../inspector-data/messages';
import type { RequestMessage, ResponseMessage } from '../../../messages/types';
import type { BevyError } from '../../brp/brp';
import { TypeSchemaService } from '../../brp/typeSchemaService';
import type { InspectorRepository } from '../../inspectorRepository';

export class ResourcesViewProvider implements vscode.WebviewViewProvider {
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
      webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'resources-view', 'index.html'))
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
          vscode.Uri.joinPath(this.extensionUri, 'dist', 'resources-view', path),
        );
        return `${attr}="${newUri}"`;
      },
    );
    this.webview.html = updatedHtml;
    this.webview.onDidReceiveMessage(async (message: unknown) => {
      if (message && typeof message === 'object' && 'type' in message) {
        const request: InspectorRequest = message as InspectorRequest;
        switch (request.type) {
          case SetResourceValue:
            this.webview!.postMessage(await this.setResourceValue(request));
            break;
          default:
            console.warn(`Unknown message type: ${JSON.stringify(message)}`);
            break;
        }
      }
    });
    this.getResources().then((event) => this.webview!.postMessage(event));
  }

  private async setResourceValue(
    request: RequestMessage<SetResourceValueRequestData>,
  ): Promise<ResponseMessage<SetResourceValueResponseData>> {
    try {
      await this.repository.setResourceValue(request.data.typePath, request.data.path, request.data.newValue);
      this.valueUpdatedEmitter.fire();
      return {
        requestId: request.id,
        data: {
          success: true,
        },
      };
    } catch (error: unknown) {
      const message = (error as Error).message;
      vscode.window.showErrorMessage(`Error setting resource value: ${message}`);
      return {
        requestId: request.id,
        data: {
          success: false,
          error: message,
        },
      };
    }
  }

  private async getResources(): Promise<ResourcesUpdatedEvent> {
    const resourceNames = await this.repository.listResourceNames();
    const resources = await Promise.all(
      resourceNames.map(async (typePath) => {
        try {
          return await this.repository.getResource(typePath);
        } catch (error) {
          return {
            value: undefined,
            error: (error as BevyError)?.message ?? `Error getting resource: ${error}`,
            schema: {
              typePath: typePath,
              shortPath: TypeSchemaService.shortenName(typePath),
            },
          };
        }
      }),
    );
    return { type: 'ResourcesUpdated', data: { resources } };
  }
}
