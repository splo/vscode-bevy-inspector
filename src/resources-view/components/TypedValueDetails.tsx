import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-container';
import { useState } from 'react';
import type { UpdateRequestedData } from '../../inspector-data/messages';
import { UpdateRequested } from '../../inspector-data/messages';
import type { TypedValue } from '../../inspector-data/types';
import { DynamicValue } from '../../schema-components/DynamicValue';
import type { ValueUpdated } from '../../schema-components/valueProps';
import { useRequest } from '../useRequest';
import { ErrorCard } from './ErrorCard';

interface TypedValueDetailsProps {
  typedValue: TypedValue;
}

export function TypedValueDetails({ typedValue }: TypedValueDetailsProps) {
  const [requestData, setRequestData] = useState<UpdateRequestedData>();
  useRequest<UpdateRequestedData>(UpdateRequested, requestData);

  if (typedValue.error || !typedValue.schema) {
    const errorMessage = typedValue.error || 'No schema found.';
    return (
      <ErrorCard message={errorMessage} title={typedValue.schema.shortPath} description={typedValue.schema.typePath} />
    );
  }

  if (typedValue === undefined) {
    return null;
  }

  const onValueChange = (event: ValueUpdated, treeValue: unknown) => {
    console.debug('onValueChange:', event, treeValue);
    setRequestData({ typePath: typedValue.schema.typePath, path: event.path, newValue: event.value });
  };

  return (
    <vscode-form-container>
      <vscode-collapsible title={typedValue.schema.shortPath} description={typedValue.schema.typePath} open>
        <DynamicValue path="" value={typedValue.value} schema={typedValue.schema} onValueChange={onValueChange} />
      </vscode-collapsible>
    </vscode-form-container>
  );
}
