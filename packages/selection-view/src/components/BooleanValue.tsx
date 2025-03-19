import '@vscode-elements/elements/dist/vscode-checkbox';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import { useId } from 'react';

export function BooleanValue({ name, value }: { name?: string; value: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{name}</vscode-label>}
      <vscode-checkbox id={id} checked={value}></vscode-checkbox>
    </vscode-form-group>
  );
}
