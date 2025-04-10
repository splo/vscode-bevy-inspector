import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import { BooleanValue } from './BooleanValue';
import { EnumValue } from './EnumValue';
import { GlobalTransformValue } from './GlobalTransformValue';
import { MatrixValue } from './MatrixValue';
import { NumberValue } from './NumberValue';
import { OptionalValue } from './OptionalValue';
import { StringValue } from './StringValue';
import { VectorValue } from './VectorValue';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function ComponentValue({
  name,
  value,
  schema,
  readOnly,
  saveValue,
}: {
  name?: string;
  value: unknown;
  schema: BevyJsonSchema;
  readOnly?: boolean;
  saveValue(data: unknown): void;
}) {
  switch (schema.typePath) {
    case 'bevy_transform::components::global_transform::GlobalTransform':
      return (
        <GlobalTransformValue
          name={name}
          value={value as number[]}
          schema={schema}
          readOnly={readOnly}
        ></GlobalTransformValue>
      );
    case 'glam::Mat3A': {
      const values = value as { x_axis: Vec3; y_axis: Vec3; z_axis: Vec3 };
      return <MatrixValue name={name} values={values} readOnly={readOnly}></MatrixValue>;
    }
    case 'glam::Vec3':
      return <VectorValue name={name} values={value as number[]} readOnly={readOnly} saveValue={saveValue} />;
    case 'glam::Vec3A': {
      const vec3a = value as { x: number; y: number; z: number };
      return <VectorValue name={name} values={[vec3a.x, vec3a.y, vec3a.z]} readOnly={readOnly} saveValue={saveValue} />;
    }
    case 'glam::Quat':
      return <VectorValue name={name} values={value as number[]} readOnly={readOnly} saveValue={saveValue} />;
  }
  if (Array.isArray(schema.oneOf)) {
    if (schema?.typePath?.startsWith('core::option::Option')) {
      return <OptionalValue name={name} value={value} schema={schema} readOnly={readOnly} saveValue={saveValue} />;
    }
    return <EnumValue name={name} value={value} schema={schema} readOnly={readOnly} saveValue={saveValue} />;
  }
  switch (schema.type) {
    case 'string':
      return (
        <StringValue name={name} value={value as string} schema={schema} readOnly={readOnly} saveValue={saveValue} />
      );
    case 'number':
      return (
        <NumberValue name={name} value={value as number} schema={schema} readOnly={readOnly} saveValue={saveValue} />
      );
    case 'boolean':
      return (
        <BooleanValue name={name} value={value as boolean} schema={schema} readOnly={readOnly} saveValue={saveValue} />
      );
    case 'array':
      return (
        <>
          {name && <vscode-label>{name}</vscode-label>}
          {((value as unknown[]) || []).map((element, index) => {
            const subSchema = Array.isArray(schema.items) ? schema.items[index] : schema.items;
            return (
              <ComponentValue
                key={index}
                value={element}
                schema={subSchema as BevyJsonSchema}
                readOnly={readOnly}
                saveValue={saveValue}
              />
            );
          })}
        </>
      );
    case 'object': {
      const subComponents = Object.entries(schema.properties || {}).map(([fieldName, fieldSchema]) => {
        const fieldValues = value as { [key: string]: unknown };
        const fieldValue = fieldValues?.[fieldName];
        return (
          <ComponentValue
            key={fieldName}
            name={fieldName}
            value={fieldValue}
            schema={fieldSchema as BevyJsonSchema}
            readOnly={readOnly}
            saveValue={(data) => saveValue({ ...fieldValues, [fieldName]: data })}
          />
        );
      });
      return (
        <>
          {name && <vscode-label>{name}</vscode-label>}
          {subComponents}
        </>
      );
    }
  }
  return (
    <vscode-form-group variant="horizontal">
      <vscode-label style={{ color: 'red' }}>
        Error: {name ?? '[Unamed]'} has unknown type: {schema.shortPath}
      </vscode-label>
      <vscode-textfield value={JSON.stringify(schema)}></vscode-textfield>
      <vscode-textfield value={JSON.stringify(value)}></vscode-textfield>
    </vscode-form-group>
  );
}
