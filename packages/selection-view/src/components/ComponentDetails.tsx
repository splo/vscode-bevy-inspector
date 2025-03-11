import {
  Component,
  GetSchemaRequestData,
  GetSchemaResponseData,
  InspectorMessage,
} from '@bevy-inspector/inspector-messages';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useMemo } from 'react';
import { useRequest } from '../useRequest';
import { ErrorCard } from './ErrorCard';

interface ComponentProps {
  component: Component;
}

export function ComponentDetails({ component }: ComponentProps) {
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
        <vscode-form-group variant="horizontal">
          <vscode-textfield value={JSON.stringify(component.value)}></vscode-textfield>
        </vscode-form-group>
      )}
      {component.error ? (
        <>
          <vscode-icon slot="decorations" name="error"></vscode-icon>
          <ErrorCard error={component.error} />
        </>
      ) : null}
    </vscode-collapsible>
  );
}
