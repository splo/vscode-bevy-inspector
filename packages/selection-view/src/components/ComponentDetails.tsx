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
import { ComponentValue } from './ComponentValue';
import { ErrorCard } from './ErrorCard';

interface ComponentProps {
  entityId: EntityId;
  component: Component;
}

export function ComponentDetails({ entityId, component }: ComponentProps) {
  const [requestData, setRequestData] = useState<SetComponentValueRequestData>();

  useRequest<SetComponentValueResponseData>(SetComponentValue, requestData);

  if (component.error || !component.schema) {
    const errorMessage = component.error || 'No schema found.';
    return (
      <vscode-collapsible title={component.schema?.shortPath} description={component.schema?.typePath}>
        <vscode-icon className="error-icon" slot="decorations" name="error"></vscode-icon>
        <ErrorCard error={errorMessage} />
      </vscode-collapsible>
    );
  }

  function saveValue(typePath: TypePath, newValue: unknown) {
    setRequestData({ entityId, typePath, newValue });
  }

  return (
    <vscode-collapsible title={component.schema.shortPath} description={component.schema.typePath} open>
      {typeof component.value === 'undefined' ? null : (
        <ComponentValue
          value={component.value}
          schema={component.schema}
          saveValue={(newValue) => saveValue(component.schema.typePath!, newValue)}
        />
      )}
    </vscode-collapsible>
  );
}
