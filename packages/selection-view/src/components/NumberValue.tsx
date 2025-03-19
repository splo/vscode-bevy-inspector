import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useId } from 'react';

export function NumberValue({ name, value }: { name?: string; value: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{name}</vscode-label>}
      <vscode-textfield id={id} type="number" value={String(value)}></vscode-textfield>
    </vscode-form-group>
  );
}
