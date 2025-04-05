import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import { ComponentValue } from './ComponentValue';
import { VectorValue } from './VectorValue';

export function GlobalTransformValue({
  value,
  schema,
  readOnly,
}: {
  name?: string;
  value: number[];
  schema: BevyJsonSchema;
  readOnly?: boolean;
}) {
  return (
    <>
      <ComponentValue
        name="matrix"
        schema={schema.properties!.matrix3}
        value={{
          x_axis: { x: value[0], y: value[1], z: value[2] },
          y_axis: { x: value[3], y: value[4], z: value[5] },
          z_axis: { x: value[6], y: value[7], z: value[8] },
        }}
        readOnly={readOnly}
      />
      <VectorValue name="translation" values={[value[9], value[10], value[11]]} readOnly={readOnly}></VectorValue>
    </>
  );
}
