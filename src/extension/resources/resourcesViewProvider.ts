import * as vscode from 'vscode';
import { loadHtml } from '../vscode/htmlLoader';

export class ResourcesViewProvider implements vscode.WebviewViewProvider {
  private readonly messageReceivedEmitter = new vscode.EventEmitter<unknown>();
  public readonly onMessageReceived = this.messageReceivedEmitter.event;
  private view: vscode.WebviewView | undefined;
  private extensionUri: vscode.Uri;

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
      htmlPath: '/dist/resources-view/index.html',
    });
    this.view.webview.onDidReceiveMessage(this.messageReceivedEmitter.fire.bind(this.messageReceivedEmitter));
  }

  public postMessage(message: unknown): void {
    if (this.view) {
      this.view.webview.postMessage(message);
    }
  }
}
