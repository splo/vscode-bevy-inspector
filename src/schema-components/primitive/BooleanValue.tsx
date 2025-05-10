import '@vscode-elements/elements/dist/vscode-checkbox';
import type { VscodeCheckbox } from '@vscode-elements/elements/dist/vscode-checkbox';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import { useId } from 'react';
import { capitalCase } from 'text-capital-case';
import type { ValueProps } from '../valueProps';

export function BooleanValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<boolean>) {
  const id = useId().replace(/:/g, '');

  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{capitalCase(name)}</vscode-label>}
      <vscode-checkbox
        id={id}
        checked={value}
        disabled={schema.readOnly || readOnly}
        onChange={onCheckboxChange}
      ></vscode-checkbox>
    </vscode-form-group>
  );

  function onCheckboxChange(event: React.ChangeEvent<VscodeCheckbox>) {
    const newValue = event.target.checked;
    onValueChange({ path, value: newValue }, newValue);
  }
}
