import { InteractiveInput } from '@designbyadrian/react-interactive-input';
import type { ChangeEvent } from 'react';
import { capitalCase } from 'text-case';
import type { Mat3 } from '../schema';
import { buildPath } from '../schema';
import type { ValueProps } from '../valueProps';
import './MatrixValue.css';

export function MatrixValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<Mat3>) {
  const onChange = (
    axis: 'x_axis' | 'y_axis' | 'z_axis',
    property: 'x' | 'y' | 'z',
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = Number(event.target.value);
    const newMatrix: Mat3 = {
      ...value,
      [axis]: {
        ...value[axis],
        [property]: newValue,
      },
    };
    const updatedPath = buildPath(path, `${axis}.${property}`);
    onValueChange({ path: updatedPath, value: newValue }, newMatrix);
  };

  return (
    <>
      <div className="matrix">
        <div className="matrix-row-label">{name && <vscode-label>{capitalCase(name)}</vscode-label>}</div>
        <div className="matrix-column-label vector-x">X</div>
        <div className="matrix-column-label vector-y">Y</div>
        <div className="matrix-column-label vector-z">Z</div>

        <div className="matrix-row-label">X Axis</div>
        <InteractiveInput
          className="matrix-value"
          value={value.x_axis.x}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('x_axis', 'x', e)}
        />
        <InteractiveInput
          className="matrix-value"
          value={value.x_axis.y}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('x_axis', 'y', e)}
        />
        <InteractiveInput
          className="matrix-value"
          value={value.x_axis.z}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('x_axis', 'z', e)}
        />

        <div className="matrix-row-label">Y Axis</div>
        <InteractiveInput
          className="matrix-value"
          value={value.y_axis.x}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('y_axis', 'x', e)}
        />
        <InteractiveInput
          className="matrix-value"
          value={value.y_axis.y}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('y_axis', 'y', e)}
        />
        <InteractiveInput
          className="matrix-value"
          value={value.y_axis.z}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('y_axis', 'z', e)}
        />

        <div className="matrix-row-label">Z Axis</div>
        <InteractiveInput
          className="matrix-value"
          value={value.z_axis.x}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('z_axis', 'x', e)}
        />
        <InteractiveInput
          className="matrix-value"
          value={value.z_axis.y}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('z_axis', 'y', e)}
        />
        <InteractiveInput
          className="matrix-value"
          value={value.z_axis.z}
          disabled={schema.readOnly || readOnly}
          onChange={(e) => onChange('z_axis', 'z', e)}
        />
      </div>
    </>
  );
}
