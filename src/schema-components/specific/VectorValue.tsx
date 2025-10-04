import { InteractiveInput } from '../../react-interactive-input';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import type { ChangeEvent } from 'react';
import { capitalCase } from 'text-capital-case';
import type { BevyJsonSchema } from '../../inspector-data/types';
import { buildPath } from '../schema';
import type { ValueProps } from '../valueProps';
import './VectorValue.css';

const LABELS = ['x', 'y', 'z', 'w'];

export function VectorValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<number[]>) {
  const values = value || Array(schema?.minItems || 0).fill(0);

  function onInputChange(event: ChangeEvent<HTMLInputElement>, index: number) {
    const newValue = Number(event.target.value);
    const newValues = [...values];
    newValues[index] = newValue;
    const updatedPath = buildPath(path, LABELS[index]);
    onValueChange({ path: updatedPath, value: newValue }, newValues);
  }

  return (
    <vscode-form-group className="vector" variant="vertical">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <div className="vector-container">
        {values.map((vectorComponentValue, index) => (
          <VectorItem
            key={index}
            index={index}
            label={LABELS[index]}
            value={vectorComponentValue}
            schema={schema}
            readOnly={readOnly}
            onInputChange={onInputChange}
          />
        ))}
      </div>
    </vscode-form-group>
  );
}

function VectorItem({
  index,
  label,
  value,
  schema,
  readOnly,
  onInputChange,
}: {
  index: number;
  label: string;
  value: number;
  schema: BevyJsonSchema;
  readOnly: boolean | undefined;
  onInputChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
}) {
  return (
    <div className="vector-item">
      <label className={`vector-value vector-${label}`}>{label}</label>
      <InteractiveInput
        className="vector-input"
        value={value}
        step={schema?.multipleOf || 0.05}
        min={schema?.minimum}
        max={schema?.maximum}
        disabled={schema.readOnly || readOnly}
        onChange={(e) => onInputChange(e, index)}
      />
    </div>
  );
}
