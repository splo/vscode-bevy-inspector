import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-container';
import { JSX, useState } from 'react';
import {
  SetResourceValue,
  SetResourceValueRequestData,
  SetResourceValueResponseData,
} from '../../inspector-data/messages';
import { Resource } from '../../inspector-data/types';
import { DynamicValue } from '../../schema-components/DynamicValue';
import { DynamicValueError, ValueUpdated } from '../../schema-components/valueProps';
import { useRequest } from '../useRequest';
import { ErrorCard } from './ErrorCard';

interface ResourceProps {
  resource: Resource;
}

export function ResourceDetails({ resource }: ResourceProps) {
  const [requestData, setRequestData] = useState<SetResourceValueRequestData>();
  const [resourceValue, setResourceValue] = useState(resource.value);
  const { response, error } = useRequest<SetResourceValueResponseData>(SetResourceValue, requestData);

  let dynamicValueError: DynamicValueError | undefined;
  let errorCard: JSX.Element | undefined;
  if ((response && !response.success) || error) {
    const errorMessage = response?.error || (error as string) || `Error while saving value: ${requestData?.newValue}`;
    if (requestData?.typePath) {
      dynamicValueError = {
        path: requestData?.path ?? '',
        message: errorMessage,
      };
    } else {
      errorCard = <ErrorCard message={errorMessage} title="Error" description="" open />;
    }
  }

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
      {errorCard}
      <vscode-collapsible title={resource.schema.shortPath} description={resource.schema.typePath} open>
        {dynamicValueError !== undefined && (
          <div className="error-card" style={{ color: 'var(--vscode-errorForeground)' }}>
            <p>{dynamicValueError.message}</p>
          </div>
        )}
        <DynamicValue path="" value={resourceValue} schema={resource.schema} onValueChange={onValueChange} />
      </vscode-collapsible>
    </vscode-form-container>
  );
}
