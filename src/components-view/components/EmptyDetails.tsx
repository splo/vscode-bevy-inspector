import './EmptyDetails.css';
import '@vscode-elements/elements/dist/vscode-icon';

export function EmptyDetails() {
  return (
    <p className="warning">
      <vscode-icon name="warning"></vscode-icon>
      Select an entity to view its components.
    </p>
  );
}
