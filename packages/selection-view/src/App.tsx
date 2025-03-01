import './App.css';
import '@vscode-elements/elements/dist/vscode-icon';
import '@vscode-elements/elements/dist/vscode-button';

if (import.meta.env.DEV) {
  await import('@vscode-elements/webview-playground');
}

function App() {
  return (
    <>
      {import.meta.env.DEV ? <vscode-dev-toolbar></vscode-dev-toolbar> : null}
      <p className="main-text">
        <vscode-icon name="warning"></vscode-icon>
        Nothing selected in the tree.
      </p>
    </>
  );
}

export default App;
