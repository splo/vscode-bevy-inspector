import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-form-helper';
import { capitalCase } from 'text-capital-case';

export function NullValue({ name }: { name?: string }) {
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <vscode-form-helper>
        <code>null</code>
      </vscode-form-helper>
    </vscode-form-group>
  );
}
