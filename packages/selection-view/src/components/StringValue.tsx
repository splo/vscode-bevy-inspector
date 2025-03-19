import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useId } from 'react';

export function StringValue({ name, value }: { name?: string; value: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{name}</vscode-label>}
      <vscode-textfield id={id} value={value}></vscode-textfield>
    </vscode-form-group>
  );
}
