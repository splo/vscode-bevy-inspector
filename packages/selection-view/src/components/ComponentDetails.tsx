import {
  Component,
  GetSchemaRequestData,
  GetSchemaResponseData,
  InspectorMessage,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
} from '@bevy-inspector/inspector-messages';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { VscodeTextfield } from '@vscode-elements/elements/dist/vscode-textfield';
import type { JSONSchema7 } from 'json-schema';
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

  const { response } = useRequest<GetSchemaResponseData>(InspectorMessage.GetSchema, data);

  return (
    <vscode-collapsible
      key={component.shortPath}
      title={component.shortPath}
      description={component.typePath}
      open={!component.error}
    >
      {typeof component.value === 'undefined' || typeof response?.schema === 'undefined' ? null : (
        <ComponentValue value={component.value} schema={response.schema} />
      )}
      {component.error ? (
        <>
          <vscode-icon slot="decorations" name="error"></vscode-icon>
          <ErrorCard error={component.error} />
        </>
      ) : null}
    </vscode-collapsible>
  );

  function ComponentValue({ name, value, schema }: { name?: string; value: unknown; schema: JSONSchema7 }) {
    switch (schema.type) {
      case 'string':
        return <StringValue name={name} value={value as string}></StringValue>;
      case 'number':
        return <NumberValue name={name} value={value as number}></NumberValue>;
      case 'boolean':
        return <BooleanValue name={name} value={value as boolean}></BooleanValue>;
      case 'object':
        console.debug('value:', value);
        return Object.entries(schema.properties || {}).map(([fieldName, fieldSchema]) => {
          const fieldValue = (value as { [key: string]: unknown })?.[fieldName];
          console.debug('{fieldName, fieldValue, fieldSchema}:', { fieldName, fieldValue, fieldSchema });
          return (
            <ComponentValue
              key={fieldName}
              name={fieldName}
              value={fieldValue}
              schema={fieldSchema as JSONSchema7}
            ></ComponentValue>
          );
        });
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
