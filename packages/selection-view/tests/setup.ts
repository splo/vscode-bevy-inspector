// VSCode Elements `vscode-icon` requires the codicon stylesheet to be loaded in the document.
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/codicon.css';
link.id = 'vscode-codicon-stylesheet';
document.head.appendChild(link);
