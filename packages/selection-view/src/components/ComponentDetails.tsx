import {
  BevyJsonSchema,
  Component,
  InspectorMessage,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
} from '@bevy-inspector/inspector-messages';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-icon';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-progress-ring';
import '@vscode-elements/elements/dist/vscode-textfield';
import { VscodeTextfield } from '@vscode-elements/elements/dist/vscode-textfield';
import { FormEvent } from 'react';
import { messenger } from '../vscodeMessenger';
import { BooleanValue } from './BooleanValue';
import { ErrorCard } from './ErrorCard';
import { NumberValue } from './NumberValue';
import { StringValue } from './StringValue';
import { VectorValue } from './VectorValue';

interface ComponentProps {
  entityId: number;
  component: Component;
}

export function ComponentDetails({ entityId, component }: ComponentProps) {
  if (component.error || !component.schema) {
    const errorMessage = component.error || 'No schema found.';
    return (
      <vscode-collapsible title={component.schema?.shortPath} description={component.schema?.typePath}>
        <vscode-icon style={{ color: 'var(--vscode-errorForeground)' }} slot="decorations" name="error"></vscode-icon>
        <ErrorCard error={errorMessage} />
      </vscode-collapsible>
    );
  }

  return (
    <vscode-collapsible title={component.schema.shortPath} description={component.schema.typePath} open>
      {typeof component.value === 'undefined' ? null : (
        <ComponentValue value={component.value} schema={component.schema} />
      )}
    </vscode-collapsible>
  );

  function ComponentValue({ name, value, schema }: { name?: string; value: unknown; schema: BevyJsonSchema }) {
    switch (schema.typePath) {
      case 'bevy_transform::components::global_transform::GlobalTransform': {
        const gtValue = value as number[];
        return (
          <>
            <ComponentValue
              name="matrix3"
              schema={schema.properties!.matrix3}
              value={{
                x_axis: { x: gtValue[0], y: gtValue[1], z: gtValue[2] },
                y_axis: { x: gtValue[3], y: gtValue[4], z: gtValue[5] },
                z_axis: { x: gtValue[8], y: gtValue[7], z: gtValue[8] },
              }}
            />
            <VectorValue name="translation" values={[gtValue[9], gtValue[10], gtValue[11]]}></VectorValue>
          </>
        );
      }
      case 'glam::Vec3':
        return <VectorValue name={name} values={value as number[]}></VectorValue>;
      case 'glam::Quat':
        return <VectorValue name={name} values={value as number[]}></VectorValue>;
    }
    switch (schema.type) {
      case 'string':
        return <StringValue name={name} value={value as string} schema={schema}></StringValue>;
      case 'number':
        return <NumberValue name={name} value={value as number} schema={schema}></NumberValue>;
      case 'boolean':
        return <BooleanValue name={name} value={value as boolean} schema={schema}></BooleanValue>;
      case 'array':
        return (
          <>
            {name && <vscode-label>{name}</vscode-label>}
            {(value as unknown[]).map((element, index) => (
              <ComponentValue key={index} value={element} schema={schema.items as BevyJsonSchema}></ComponentValue>
            ))}
          </>
        );
      case 'object': {
        const subComponents = Object.entries(schema.properties || {}).map(([fieldName, fieldSchema]) => {
          const fieldValue = (value as { [key: string]: unknown })?.[fieldName];
          return (
            <ComponentValue
              key={fieldName}
              name={fieldName}
              value={fieldValue}
              schema={fieldSchema as BevyJsonSchema}
            ></ComponentValue>
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
        <vscode-textfield value={JSON.stringify(schema)}></vscode-textfield>
        <vscode-textfield onInput={onValueChanged} value={JSON.stringify(value)}></vscode-textfield>
      </vscode-form-group>
    );
  }

  function onValueChanged(event: FormEvent<VscodeTextfield>) {
    const data: SetComponentValueRequestData = {
      entityId,
      typePath: component.schema.typePath,
      newValue: JSON.parse(event.currentTarget.value),
    };
    messenger
      .sendRequest<SetComponentValueResponseData>(InspectorMessage.SetComponentValue, data)
      .then(console.debug)
      .catch(console.warn);
  }
}
