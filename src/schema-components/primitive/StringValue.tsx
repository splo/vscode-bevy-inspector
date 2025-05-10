import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import type { VscodeTextfield } from '@vscode-elements/elements/dist/vscode-textfield';
import type { FormEvent } from 'react';
import { useId } from 'react';
import { capitalCase } from 'text-capital-case';
import type { ValueProps } from '../valueProps';

export function StringValue({ name, path, value, readOnly, onValueChange }: ValueProps<string>) {
  const id = useId().replace(/:/g, '');

  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{capitalCase(name)}</vscode-label>}
      <vscode-textfield id={id} value={value} disabled={readOnly} onInput={onTextFieldInput}></vscode-textfield>
    </vscode-form-group>
  );

  function onTextFieldInput(event: FormEvent<VscodeTextfield>) {
    const newValue = (event.target as HTMLInputElement).value;
    onValueChange({ path, value: newValue }, newValue);
  }
}
