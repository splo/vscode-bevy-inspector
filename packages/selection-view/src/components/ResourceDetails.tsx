import {
  SetResourceValue,
  SetResourceValueRequestData,
  SetResourceValueResponseData,
} from '@bevy-inspector/inspector-data/messages';
import { Resource } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-container';
import { useState } from 'react';
import { useRequest } from '../useRequest';
import { ErrorCard } from './ErrorCard';
import { DynamicValue } from './values/DynamicValue';
import { ValueUpdated } from './values/valueProps';

interface ResourceProps {
  resource: Resource;
}

export function ResourceDetails({ resource }: ResourceProps) {
  const [requestData, setRequestData] = useState<SetResourceValueRequestData>();
  const [resourceValue, setResourceValue] = useState(resource.value);
  const { response, error } = useRequest<SetResourceValueResponseData>(SetResourceValue, requestData);

  if (resource.error || !resource.schema) {
    const errorMessage = resource.error || 'No schema found.';
    return (
      <ErrorCard message={errorMessage} title={resource.schema.shortPath} description={resource.schema.typePath} />
    );
  }
  if ((response && !response.success) || error) {
    const errorMessage = response?.error || (error as string) || `Error while saving value: ${requestData?.newValue}`;
    return (
      <ErrorCard message={errorMessage} title={resource.schema.shortPath} description={resource.schema.typePath} open />
    );
  }

  if (typeof resourceValue === 'undefined') {
    return null;
  }

  const onValueChange = (event: ValueUpdated, treeValue: unknown) => {
    console.debug('onValueChange:', event, treeValue);
    setResourceValue(treeValue);
    setRequestData({ typePath: resource.schema.typePath, path: event.path, newValue: event.value });
  };

  return (
    <vscode-form-container>
      <vscode-collapsible title={resource.schema.shortPath} description={resource.schema.typePath} open>
        <DynamicValue path="" value={resourceValue} schema={resource.schema} onValueChange={onValueChange} />
      </vscode-collapsible>
    </vscode-form-container>
  );
}
