import './EmptyDetails.css';
import '@vscode-elements/elements/dist/vscode-icon';

export function EmptyDetails() {
  return (
    <p className="warning">
      <vscode-icon name="warning"></vscode-icon>
      Nothing selected in the tree!
    </p>
  );
}
