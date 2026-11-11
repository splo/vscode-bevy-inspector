import * as vscode from 'vscode';
import type { TypedValue } from '../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import { loadHtml } from '../vscode/htmlLoader';

export class ComponentsViewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
  private extensionUri: vscode.Uri;
  private view: vscode.WebviewView | undefined;
  private viewDisposables: vscode.Disposable[] = [];
  private readonly messageReceivedEmitter = new vscode.EventEmitter<unknown>();
  private readonly visibilityChangeEmitter = new vscode.EventEmitter<boolean>();
  public readonly onMessageReceived = this.messageReceivedEmitter.event;
  public readonly onVisibilityChanged = this.visibilityChangeEmitter.event;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.viewDisposables.splice(0).forEach((disposable) => disposable.dispose());
    this.view = webviewView;
    this.view.webview.options = {
      enableScripts: true,
    };
    this.viewDisposables.push(
      webviewView.onDidChangeVisibility(() => this.visibilityChangeEmitter.fire(webviewView.visible)),
      webviewView.webview.onDidReceiveMessage(this.messageReceivedEmitter.fire.bind(this.messageReceivedEmitter)),
      webviewView.onDidDispose(() => {
        this.view = undefined;
        this.viewDisposables.splice(0).forEach((disposable) => disposable.dispose());
      }),
    );
    this.view.webview.html = loadHtml({
      webview: this.view.webview,
      contentBaseUri: this.extensionUri,
      htmlPath: '/dist/components-view/index.html',
    });
  }

  dispose(): void {
    this.viewDisposables.splice(0).forEach((disposable) => disposable.dispose());
    this.view = undefined;
    this.messageReceivedEmitter.dispose();
    this.visibilityChangeEmitter.dispose();
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
