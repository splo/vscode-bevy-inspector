import '@vscode-elements/elements/dist/vscode-button';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import { capitalCase } from 'text-case';
import type { BevyJsonSchema } from '../../inspector-data/types';
import { DynamicValue } from '../DynamicValue';
import { generateDefault } from '../../inspector-data/schema';
import type { ValueProps, ValueUpdated } from '../valueProps';
import './ArrayValue.css';

export function ArrayValue({ name, path, value: initial, schema, readOnly, onValueChange }: ValueProps<unknown[]>) {
  const values = initial || [];
  if (!schema.items || Array.isArray(schema.items)) {
    return null;
  }
  const onChildValueChange = (event: ValueUpdated, treeValue: unknown, index: number) => {
    const newValues = [...values];
    newValues[index] = treeValue;
    onValueChange(event, newValues);
  };
  return (
    <vscode-form-group variant="vertical">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      {values.map((element, index) => (
        <div key={index} className="array-value">
          <div>
            <DynamicValue
              path={`${path}[${index}]`}
              value={element}
              schema={schema.items as BevyJsonSchema}
              readOnly={readOnly}
              onValueChange={(event, treeValue) => onChildValueChange(event, treeValue, index)}
            />
          </div>
          {!(schema.readOnly || readOnly) && (
            <vscode-button icon="trash" onClick={() => removeElement(index)} title="Remove Element"></vscode-button>
          )}
        </div>
      ))}
      {!(schema.readOnly || readOnly) && (
        <vscode-button icon="add" onClick={addNewElement}>
          Add Element
        </vscode-button>
      )}
    </vscode-form-group>
  );

  function addNewElement() {
    const newElement = generateDefault(schema.items as BevyJsonSchema);
    const newValues = [...values, newElement];
    onValueChange({ path, value: newValues }, newValues);
  }

  function removeElement(index: number) {
    const newValues = [...values];
    newValues.splice(index, 1);
    onValueChange({ path, value: newValues }, newValues);
  }
}
