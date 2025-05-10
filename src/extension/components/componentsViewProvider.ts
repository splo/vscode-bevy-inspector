import * as vscode from 'vscode';
import type { TypedValue } from '../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import { loadHtml } from '../vscode/htmlLoader';

export class ComponentsViewProvider implements vscode.WebviewViewProvider {
  private readonly messageReceivedEmitter = new vscode.EventEmitter<unknown>();
  public readonly onMessageReceived = this.messageReceivedEmitter.event;
  private extensionUri: vscode.Uri;
  private view: vscode.WebviewView | undefined;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    this.view.webview.options = {
      enableScripts: true,
    };
    this.view.webview.html = loadHtml({
      webview: this.view.webview,
      contentBaseUri: this.extensionUri,
      htmlPath: '/dist/components-view/index.html',
    });
    this.view.webview.onDidReceiveMessage(this.messageReceivedEmitter.fire.bind(this.messageReceivedEmitter));
  }

  public postMessage(message: unknown): void {
    if (this.view) {
      this.view.webview.postMessage(message);
    }
  }

  public updateWithNoSelection() {
    if (this.view) {
      this.view.title = 'Components';
    }
  }

  public updateWithSelectedEntity(entity: EntityNode, components: TypedValue[]) {
    if (this.view) {
      this.view.title = `Components of ${entity.name ?? entity.id}`;
      const tooltip = entity.componentNames.join('\n');
      this.view.badge = {
        value: components.length,
        tooltip,
      };
      this.view.show(true);
    }
  }
}
