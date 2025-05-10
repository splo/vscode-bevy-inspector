import { ArrayValue } from './composite/ArrayValue';
import { EnumValue } from './composite/EnumValue';
import { ObjectValue } from './composite/ObjectValue';
import { OptionalValue } from './composite/OptionalValue';
import { TupleValue } from './composite/TupleValue';
import './DynamicValue.css';
import { BooleanValue } from './primitive/BooleanValue';
import { NullValue } from './primitive/NullValue';
import { NumberValue } from './primitive/NumberValue';
import { StringValue } from './primitive/StringValue';
import type { Mat3, Vec3 } from './schema';
import { GlobalTransformValue } from './specific/GlobalTransformValue';
import { MatrixValue } from './specific/MatrixValue';
import { VectorValue } from './specific/VectorValue';
import type { ValueProps } from './valueProps';
import { ErrorBoundary } from './ErrorBoundary';

export function DynamicValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<unknown>) {
  return (
    <ErrorBoundary>
      {(() => {
        switch (schema.typePath) {
          case 'bevy_transform::components::global_transform::GlobalTransform':
            return (
              <GlobalTransformValue
                name={name}
                path={path}
                value={value as number[]}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          case 'glam::Mat3A': {
            return (
              <MatrixValue
                name={name}
                path={path}
                value={value as Mat3}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          }
          case 'glam::Vec3':
          case 'glam::Quat':
            return (
              <VectorValue
                name={name}
                path={path}
                value={value as number[]}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          case 'glam::Vec3A': {
            const vec3 = value as Vec3;
            return (
              <VectorValue
                name={name}
                path={path}
                value={[vec3.x, vec3.y, vec3.z]}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          }
        }
        if (Array.isArray(schema.oneOf)) {
          if (schema?.typePath?.startsWith('core::option::Option')) {
            return (
              <OptionalValue
                name={name}
                path={path}
                value={value}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          }
          return (
            <EnumValue
              name={name}
              path={path}
              value={value}
              schema={schema}
              readOnly={readOnly}
              onValueChange={onValueChange}
            />
          );
        }
        switch (schema.type) {
          case 'string':
            return (
              <StringValue
                name={name}
                path={path}
                value={value as string}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          case 'number':
            return (
              <NumberValue
                name={name}
                path={path}
                value={value as number}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          case 'boolean':
            return (
              <BooleanValue
                name={name}
                path={path}
                value={value as boolean}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          case 'array': {
            if (Array.isArray(schema.items)) {
              return (
                <TupleValue
                  name={name}
                  path={path}
                  value={(value as unknown[]) || []}
                  schema={schema}
                  readOnly={readOnly}
                  onValueChange={onValueChange}
                />
              );
            } else {
              return (
                <ArrayValue
                  name={name}
                  path={path}
                  value={(value as unknown[]) || []}
                  schema={schema}
                  readOnly={readOnly}
                  onValueChange={onValueChange}
                />
              );
            }
          }
          case 'object':
            return (
              <ObjectValue
                name={name}
                path={path}
                value={value as Record<string, unknown>}
                schema={schema}
                readOnly={readOnly}
                onValueChange={onValueChange}
              />
            );
          case 'null':
            return <NullValue name={name} />;
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
      })()}
    </ErrorBoundary>
  );
}
