import {
  BevyJsonSchema,
  Component,
  GetSchemaRequestData,
  GetSchemaResponseData,
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
import { FormEvent, useMemo } from 'react';
import { useRequest } from '../useRequest';
import { messenger } from '../vscodeMessenger';
import { BooleanValue } from './BooleanValue';
import { ErrorCard } from './ErrorCard';
import { NumberValue } from './NumberValue';
import { StringValue } from './StringValue';

interface ComponentProps {
  entityId: number;
  component: Component;
}

export function ComponentDetails({ entityId, component }: ComponentProps) {
  const data: GetSchemaRequestData = useMemo(
    () => ({
      componentTypePath: component.typePath,
    }),
    [component.typePath],
  );

  const { response, error } = useRequest<GetSchemaResponseData>(InspectorMessage.GetSchema, data);

  let errorMessage: string | undefined;
  if (error || component.error) {
    errorMessage = component.error || String(error);
  }

  return (
    <vscode-collapsible
      key={component.shortPath}
      title={component.shortPath}
      description={component.typePath}
      open={!component.error}
    >
      {!response && !errorMessage && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <vscode-progress-ring />
        </div>
      )}
      {typeof component.value === 'undefined' || typeof response?.schema === 'undefined' ? null : (
        <ComponentValue value={component.value} schema={response.schema} />
      )}
      {errorMessage ? (
        <>
          <vscode-icon style={{ color: 'var(--vscode-errorForeground)' }} slot="decorations" name="error"></vscode-icon>
          <ErrorCard error={errorMessage} />
        </>
      ) : null}
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
            <ComponentValue
              name="translation"
              schema={schema.properties!.translation}
              value={{
                x: gtValue[9],
                y: gtValue[10],
                z: gtValue[11],
              }}
            />
          </>
        );
      }
      case 'glam::Vec3':
        return (
          <>
            {name && <vscode-label>{name}</vscode-label>}
            <NumberValue name="x" value={(value as number[])[0]}></NumberValue>
            <NumberValue name="y" value={(value as number[])[1]}></NumberValue>
            <NumberValue name="z" value={(value as number[])[2]}></NumberValue>
          </>
        );
      case 'glam::Quat':
        return (
          <>
            {name && <vscode-label>{name}</vscode-label>}
            <NumberValue name="x" value={(value as number[])[0]}></NumberValue>
            <NumberValue name="y" value={(value as number[])[1]}></NumberValue>
            <NumberValue name="z" value={(value as number[])[2]}></NumberValue>
            <NumberValue name="w" value={(value as number[])[3]}></NumberValue>
          </>
        );
    }
    switch (schema.type) {
      case 'string':
        return <StringValue name={name} value={value as string}></StringValue>;
      case 'number':
        return <NumberValue name={name} value={value as number}></NumberValue>;
      case 'boolean':
        return <BooleanValue name={name} value={value as boolean}></BooleanValue>;
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
      typePath: component.typePath,
      newValue: JSON.parse(event.currentTarget.value),
    };
    messenger
      .sendRequest<SetComponentValueResponseData>(InspectorMessage.SetComponentValue, data)
      .then(console.debug)
      .catch(console.warn);
  }
}
