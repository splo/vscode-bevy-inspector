import { capitalCase } from 'text-case';
import { BevyJsonSchema } from '../../inspector-data/types';
import { DynamicValue } from '../DynamicValue';
import { buildPath } from '../schema';
import { ValueProps, ValueUpdated } from '../valueProps';

export function ObjectValue({
  name,
  path,
  schema,
  value,
  readOnly,
  onValueChange,
}: ValueProps<Record<string, unknown>>) {
  const onChildValueChange = (event: ValueUpdated, treeValue: unknown, fieldName: string) => {
    const newValue = { ...(value ?? {}), [fieldName]: treeValue };
    onValueChange(event, newValue);
  };

  const subComponents = Object.entries(schema.properties || {}).map(([fieldName, fieldSchema]) => {
    const fieldValue = value?.[fieldName];
    return (
      <DynamicValue
        key={fieldName}
        name={fieldName}
        path={buildPath(path, fieldName)}
        value={fieldValue}
        schema={fieldSchema as BevyJsonSchema}
        readOnly={readOnly}
        onValueChange={(event, treeValue) => onChildValueChange(event, treeValue, fieldName)}
      />
    );
  });
  return (
    <>
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      {subComponents}
    </>
  );
}
