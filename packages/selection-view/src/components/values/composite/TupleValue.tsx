import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import { useState } from 'react';
import { capitalCase } from 'text-case';
import { DynamicValue } from '../DynamicValue';
import { ValueProps, ValueUpdated } from '../valueProps';

export function TupleValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<unknown[]>) {
  const [currentValues, setCurrentValues] = useState<unknown[]>(value);
  if (!schema.items || !Array.isArray(schema.items)) {
    return null;
  }

  const onChildValueChange = (event: ValueUpdated, treeValue: unknown, index: number) => {
    const newValues = [...currentValues];
    newValues[index] = treeValue;
    setCurrentValues(newValues);
    onValueChange(event, newValues);
  };

  return (
    <vscode-form-group variant="vertical">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      {currentValues.map((element, index) => {
        const subSchema = (schema.items as BevyJsonSchema[])[index];
        return (
          <DynamicValue
            key={index}
            path={`${path}[${index}]`}
            value={element}
            schema={subSchema as BevyJsonSchema}
            readOnly={readOnly}
            onValueChange={(event, treeValue) => onChildValueChange(event, treeValue, index)}
          />
        );
      })}
    </vscode-form-group>
  );
}
