import { createContext, useContext } from 'react';
import { WebviewApi } from '@tomjs/vscode-webview';

export const webviewApi = new WebviewApi();

export const WebviewApiContext = createContext(webviewApi);

export function useWebviewApi() {
  return useContext(WebviewApiContext);
}
