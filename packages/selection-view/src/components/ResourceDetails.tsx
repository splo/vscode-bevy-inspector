import {
  SetResourceValue,
  SetResourceValueRequestData,
  SetResourceValueResponseData,
} from '@bevy-inspector/inspector-data/messages';
import { Resource, TypePath } from '@bevy-inspector/inspector-data/types';
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

interface ResourceProps {
  resource: Resource;
}

export function ResourceDetails({ resource }: ResourceProps) {
  const [requestData, setRequestData] = useState<SetResourceValueRequestData>();

  const { response, error } = useRequest<SetResourceValueResponseData>(SetResourceValue, requestData);

  if (resource.error || !resource.schema) {
    const errorMessage = resource.error || 'No schema found.';
    return (
      <ErrorCard message={errorMessage} title={resource.schema.shortPath!} description={resource.schema.typePath!} />
    );
  }
  if ((response && !response.success) || error) {
    const errorMessage = response?.error || (error as string) || `Error while saving value: ${requestData?.newValue}`;
    return (
      <ErrorCard
        message={errorMessage}
        title={resource.schema.shortPath!}
        description={resource.schema.typePath!}
        open
      />
    );
  }

  function saveValue(typePath: TypePath, newValue: unknown) {
    setRequestData({ typePath, newValue });
  }

  if (typeof resource.value === 'undefined') {
    return null;
  }

  try {
    return (
      <vscode-collapsible title={resource.schema.shortPath} description={resource.schema.typePath} open>
        <ComponentValue
          value={resource.value}
          schema={resource.schema}
          saveValue={(newValue) => saveValue(resource.schema.typePath!, newValue)}
        />
      </vscode-collapsible>
    );
  } catch (error) {
    <ErrorCard
      message={`Error while rendering component: ${error}. Value: ${JSON.stringify(resource.value, null, 2)}`}
      title={resource.schema.shortPath!}
      description={resource.schema.typePath!}
      open
    />;
  }
}
