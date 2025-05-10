import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import { capitalCase } from 'text-case';
import type { BevyJsonSchema } from '../../inspector-data/types';
import { DynamicValue } from '../DynamicValue';
import type { ValueProps, ValueUpdated } from '../valueProps';

export function TupleValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<unknown[]>) {
  if (!schema.items || !Array.isArray(schema.items)) {
    return null;
  }

  const onChildValueChange = (event: ValueUpdated, treeValue: unknown, index: number) => {
    const newValues = [...value];
    newValues[index] = treeValue;
    onValueChange(event, newValues);
  };

  return (
    <vscode-form-group variant="vertical">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      {value.map((element, index) => {
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
