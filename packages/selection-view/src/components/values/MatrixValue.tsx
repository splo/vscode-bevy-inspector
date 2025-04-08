import { InteractiveInput } from '@designbyadrian/react-interactive-input';
import './MatrixValue.css';
import { capitalCase } from 'text-case';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface MatrixValueProps {
  name?: string;
  values: {
    x_axis: Vec3;
    y_axis: Vec3;
    z_axis: Vec3;
  };
  readOnly?: boolean;
}

export function MatrixValue({ name, values, readOnly }: MatrixValueProps) {
  return (
    <>
      <div className="matrix">
        <div className="matrix-row-label">{name && <vscode-label>{capitalCase(name)}</vscode-label>}</div>
        <div className="matrix-column-label vector-x">X</div>
        <div className="matrix-column-label vector-y">Y</div>
        <div className="matrix-column-label vector-z">Z</div>
        <div className="matrix-row-label">X Axis</div>
        <InteractiveInput className="matrix-value" value={values.x_axis.x} disabled={readOnly}></InteractiveInput>
        <InteractiveInput className="matrix-value" value={values.x_axis.y} disabled={readOnly}></InteractiveInput>
        <InteractiveInput className="matrix-value" value={values.x_axis.z} disabled={readOnly}></InteractiveInput>
        <div className="matrix-row-label">Y Axis</div>
        <InteractiveInput className="matrix-value" value={values.y_axis.x} disabled={readOnly}></InteractiveInput>
        <InteractiveInput className="matrix-value" value={values.y_axis.y} disabled={readOnly}></InteractiveInput>
        <InteractiveInput className="matrix-value" value={values.y_axis.z} disabled={readOnly}></InteractiveInput>
        <div className="matrix-row-label">Z Axis</div>
        <InteractiveInput className="matrix-value" value={values.z_axis.x} disabled={readOnly}></InteractiveInput>
        <InteractiveInput className="matrix-value" value={values.z_axis.y} disabled={readOnly}></InteractiveInput>
        <InteractiveInput className="matrix-value" value={values.z_axis.z} disabled={readOnly}></InteractiveInput>
      </div>
    </>
  );
}
