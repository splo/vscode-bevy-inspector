import fs from 'fs';
import * as vscode from 'vscode';

export function loadHtml({
  webview,
  contentBaseUri,
  htmlPath,
}: {
  webview: vscode.Webview;
  contentBaseUri: vscode.Uri;
  htmlPath: string;
}): string {
  const htmlUri = webview.asWebviewUri(vscode.Uri.joinPath(contentBaseUri, htmlPath));
  const rawHtml = fs.readFileSync(htmlUri.fsPath, 'utf-8');
  const updatedHtml = rawHtml.replace(/(src|href)=["']([^"']*)["']/g, (_match: string, attr: string, path: string) => {
    if (path.startsWith('data:')) {
      return `${attr}="${path}"`;
    }
    const newUri = webview.asWebviewUri(vscode.Uri.joinPath(contentBaseUri, path));
    return `${attr}="${newUri}"`;
  });
  return updatedHtml;
}
