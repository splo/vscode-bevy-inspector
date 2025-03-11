import { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { SelectionView } from './SelectionView.tsx';

let vscodeToolbar: JSX.Element | null = null;
if (import.meta.env.DEV) {
  await import('@vscode-elements/webview-playground');
  vscodeToolbar = <vscode-dev-toolbar />;
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <>
    {vscodeToolbar}
    <SelectionView />
  </>,
);
