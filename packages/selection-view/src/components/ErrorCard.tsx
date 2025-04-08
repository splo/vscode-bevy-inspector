import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-icon';
import './ErrorCard.css';

export function ErrorCard({
  message,
  title,
  description,
  open = false,
}: {
  message: string;
  title: string;
  description: string;
  open?: boolean;
}) {
  return (
    <vscode-collapsible className="error-card" title={title} description={description} open={open}>
      <vscode-icon className="error-icon" slot="decorations" name="error"></vscode-icon>
      <p>{message}</p>
    </vscode-collapsible>
  );
}
