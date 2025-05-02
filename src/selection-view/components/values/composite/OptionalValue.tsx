import { VscodeCheckbox } from '@vscode-elements/elements/dist/vscode-checkbox';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-option';
import '@vscode-elements/elements/dist/vscode-single-select';
import { FormEvent, useState } from 'react';
import { capitalCase } from 'text-case';
import { DynamicValue } from '../DynamicValue';
import { generateDefault } from '../schema';
import { ValueProps } from '../valueProps';

export function OptionalValue({
  name,
  path,
  value: initialValue,
  schema,
  readOnly,
  onValueChange,
}: ValueProps<unknown>) {
  const [value, setValue] = useState(initialValue);
  const [hasSome, setHasSome] = useState(value !== null);
  const valueSchema = (schema.oneOf || []).find((option) => option.const !== null);

  if (!schema.oneOf || schema.oneOf.length !== 2 || valueSchema === undefined) {
    return null;
  }

  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <vscode-checkbox
        style={{ alignSelf: 'center' }}
        checked={hasSome}
        onChange={onCheckboxChange}
        disabled={readOnly}
      ></vscode-checkbox>
      <DynamicValue
        path={path}
        value={value}
        schema={valueSchema}
        readOnly={readOnly || !hasSome}
        onValueChange={(event, treeValue) => {
          setValue(treeValue);
          onValueChange(event, treeValue);
        }}
      />
    </vscode-form-group>
  );

  function onCheckboxChange(event: FormEvent<VscodeCheckbox>) {
    const isChecked = (event.target as HTMLInputElement).checked;
    setHasSome(isChecked);
    const defaultedValue = value === null ? generateDefault(valueSchema || {}) : value;
    const newValue = isChecked ? defaultedValue : null;
    onValueChange({ path, value: newValue }, newValue);
  }
}
