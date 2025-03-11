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
import { FormEvent, useMemo } from 'react';
import { useRequest } from '../useRequest';
import { messenger } from '../vscodeMessenger';
import { ErrorCard } from './ErrorCard';

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

  useRequest<GetSchemaResponseData>(InspectorMessage.GetSchema, data);

  return (
    <vscode-collapsible
      key={component.shortPath}
      title={component.shortPath}
      description={component.typePath}
      open={!component.error}
    >
      {typeof component.value === 'undefined' ? null : (
        <>
          <vscode-form-group variant="horizontal">
            <vscode-textfield onInput={onValueChanged} value={JSON.stringify(component.value)}></vscode-textfield>
          </vscode-form-group>
        </>
      )}
      {component.error ? (
        <>
          <vscode-icon slot="decorations" name="error"></vscode-icon>
          <ErrorCard error={component.error} />
        </>
      ) : null}
    </vscode-collapsible>
  );

  function onValueChanged(event: FormEvent<VscodeTextfield>) {
    const data: SetComponentValueRequestData = {
      entityId,
      typePath: component.typePath,
      newValue: JSON.parse(event.currentTarget.value),
    };
    messenger.sendRequest<SetComponentValueResponseData>(InspectorMessage.SetComponentValue, data).then(console.log);
  }
}
