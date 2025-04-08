import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import { VscodeCheckbox } from '@vscode-elements/elements/dist/vscode-checkbox';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-option';
import '@vscode-elements/elements/dist/vscode-single-select';
import { FormEvent, useState } from 'react';
import { capitalCase } from 'text-case';
import { ComponentValue } from './ComponentValue';

export function OptionalValue({
  name,
  value,
  schema,
  readOnly,
}: {
  name?: string;
  value: unknown;
  schema: BevyJsonSchema;
  readOnly?: boolean;
}) {
  const [hasSome, setHasSome] = useState(value !== null);
  if (!schema.oneOf || schema.oneOf.length !== 2) {
    return null;
  }
  const valueSchema = schema.oneOf.find((option) => option.const !== null);
  if (valueSchema === undefined) {
    return null;
  }
  const valueElement =
    valueSchema.type === 'boolean' ? null : (
      <ComponentValue value={value} schema={valueSchema} readOnly={!hasSome} saveValue={console.debug} />
    );

  function handleOnChange(event: FormEvent<VscodeCheckbox>): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    setHasSome(isChecked);
  }

  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <vscode-checkbox
        style={{ alignSelf: 'center' }}
        checked={hasSome}
        onChange={handleOnChange}
        disabled={readOnly}
      ></vscode-checkbox>
      {valueElement}
    </vscode-form-group>
  );
}
