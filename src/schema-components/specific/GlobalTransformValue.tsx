import { DynamicValue } from '../DynamicValue';
import type { Mat3 } from '../schema';
import { buildPath } from '../schema';
import type { ValueProps, ValueUpdated } from '../valueProps';
import { VectorValue } from './VectorValue';

export function GlobalTransformValue({ path, value, schema, readOnly, onValueChange }: ValueProps<number[]>) {
  const { matrix, translation } = fromFlatValues(value);

  const onMatrixUpdate = (_event: ValueUpdated, updatedMatrix: unknown): void => {
    const flatValues = toFlatValues(updatedMatrix as Mat3, translation);
    const newEvent = {
      path,
      value: flatValues,
    };
    onValueChange(newEvent, flatValues);
  };

  const onTranslationUpdate = (_event: ValueUpdated, updatedTranslation: unknown): void => {
    const flatValues = toFlatValues(matrix, updatedTranslation as number[]);
    const newEvent = {
      path,
      value: flatValues,
    };
    onValueChange(newEvent, flatValues);
  };

  return (
    <>
      <DynamicValue
        name="matrix"
        path={buildPath(path, 'matrix')}
        schema={schema.properties!.matrix3}
        value={matrix}
        readOnly={readOnly}
        onValueChange={onMatrixUpdate}
      />
      <VectorValue
        name="translation"
        path={buildPath(path, 'translation')}
        value={translation}
        readOnly={readOnly}
        schema={schema.properties!.translation}
        onValueChange={onTranslationUpdate}
      />
    </>
  );
}

function fromFlatValues(values: number[]): { matrix: Mat3; translation: number[] } {
  return {
    matrix: {
      x_axis: { x: values[0], y: values[1], z: values[2] },
      y_axis: { x: values[3], y: values[4], z: values[5] },
      z_axis: { x: values[6], y: values[7], z: values[8] },
    },
    translation: [values[9], values[10], values[11]],
  };
}

function toFlatValues(matrix: Mat3, translation: number[]): number[] {
  return [
    matrix.x_axis.x,
    matrix.x_axis.y,
    matrix.x_axis.z,
    matrix.y_axis.x,
    matrix.y_axis.y,
    matrix.y_axis.z,
    matrix.z_axis.x,
    matrix.z_axis.y,
    matrix.z_axis.z,
    translation[0],
    translation[1],
    translation[2],
  ];
}
