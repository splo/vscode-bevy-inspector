import {
  SetComponentValue,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
} from '@bevy-inspector/inspector-data/messages';
import { Component, EntityId, TypePath } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-icon';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-progress-ring';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useState } from 'react';
import { useRequest } from '../useRequest';
import './ComponentDetails.css';
import { ErrorCard } from './ErrorCard';
import { ComponentValue } from './values/ComponentValue';

interface ComponentProps {
  entityId: EntityId;
  component: Component;
}

export function ComponentDetails({ entityId, component }: ComponentProps) {
  const [requestData, setRequestData] = useState<SetComponentValueRequestData>();

  const { response, error } = useRequest<SetComponentValueResponseData>(SetComponentValue, requestData);

  if (component.error || !component.schema) {
    const errorMessage = component.error || 'No schema found.';
    return (
      <ErrorCard message={errorMessage} title={component.schema.shortPath!} description={component.schema.typePath!} />
    );
  }
  if ((response && !response.success) || error) {
    const errorMessage = response?.error || (error as string) || `Error while saving value: ${requestData?.newValue}`;
    return (
      <ErrorCard
        message={errorMessage}
        title={component.schema.shortPath!}
        description={component.schema.typePath!}
        open
      />
    );
  }

  function saveValue(typePath: TypePath, newValue: unknown) {
    setRequestData({ entityId, typePath, newValue });
  }

  if (typeof component.value === 'undefined') {
    return null;
  }

  try {
    return (
      <vscode-collapsible title={component.schema.shortPath} description={component.schema.typePath} open>
        <ComponentValue
          value={component.value}
          schema={component.schema}
          saveValue={(newValue) => saveValue(component.schema.typePath!, newValue)}
        />
      </vscode-collapsible>
    );
  } catch (error) {
    <ErrorCard
      message={`Error while rendering component: ${error}. Value: ${JSON.stringify(component.value, null, 2)}`}
      title={component.schema.shortPath!}
      description={component.schema.typePath!}
      open
    />;
  }
}
