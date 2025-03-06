import { WebviewApiContext, webviewApi } from './WebviewApiContext';

export const WebviewApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WebviewApiContext.Provider value={webviewApi}>{children}</WebviewApiContext.Provider>
);
