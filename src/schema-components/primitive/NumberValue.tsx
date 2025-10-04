import { InteractiveInput } from '../../react-interactive-input';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import type { ChangeEvent } from 'react';
import { useId } from 'react';
import { capitalCase } from 'text-capital-case';
import type { ValueProps } from '../valueProps';

export function NumberValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<number>) {
  const id = useId().replace(/:/g, '');

  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{capitalCase(name)}</vscode-label>}
      <InteractiveInput
        id={id}
        value={value}
        step={schema?.multipleOf || 0.05}
        min={schema?.minimum}
        max={schema?.maximum}
        disabled={schema.readOnly || readOnly}
        onChange={onNumberInputChange}
      />
    </vscode-form-group>
  );

  function onNumberInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const newValue = parseFloat(event.target.value);
    onValueChange({ path, value: newValue }, newValue);
  }
}
