import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-container';
import '@vscode-elements/elements/dist/vscode-form-group';
import { JSX, useEffect, useId, useState } from 'react';
import {
  SetComponentValue,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
} from '../../inspector-data/messages';
import { Component, Entity, TypePath } from '../../inspector-data/types';
import { DynamicValue } from '../../schema-components/DynamicValue';
import { DynamicValueError, ValueUpdated } from '../../schema-components/valueProps';
import { useRequest } from '../useRequest';
import { ErrorCard } from './ErrorCard';

interface EntityProps {
  entity: Entity;
}

export function EntityDetails({ entity }: EntityProps) {
  const [requestData, setRequestData] = useState<SetComponentValueRequestData>();
  const { response, error } = useRequest<SetComponentValueResponseData>(SetComponentValue, requestData);

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

  const onValueUpdated = (event: ValueUpdated, typePath: TypePath) => {
    setRequestData({
      entityId: entity.id,
      typePath,
      path: event.path,
      newValue: event.value,
    });
  };

  return (
    <vscode-form-container>
      <h2 style={{ width: '100%', textAlign: 'center' }}>{entity.name ?? entity.id.toString()}</h2>
      <EntityId entityId={entity.id} />
      {errorCard}
      {entity.components.sort(componentComparator).map((component, index) => (
        <ComponentCard
          key={index}
          component={component}
          error={requestData?.typePath === component.schema.typePath ? dynamicValueError : undefined}
          onValueUpdated={onValueUpdated}
        />
      ))}
    </vscode-form-container>
  );
}

function EntityId({ entityId }: { entityId: number }) {
  const id = useId().replace(/:/g, ''); // useId() wraps generated string with ":" which is not suitable for HTML IDs.
  return (
    <vscode-form-group variant="horizontal">
      <vscode-label htmlFor={id}>ID</vscode-label>
      <vscode-textfield id={id} type="number" readonly value={entityId.toString()}></vscode-textfield>
    </vscode-form-group>
  );
}

function ComponentCard({
  component,
  error,
  onValueUpdated,
}: {
  component: Component;
  error: DynamicValueError | undefined;
  onValueUpdated: (event: ValueUpdated, typePath: TypePath) => void;
}) {
  const [componentValue, setComponentValue] = useState(component.value);
  useEffect(() => {
    setComponentValue(component.value);
  }, [component.value]);
  return (
    <vscode-collapsible title={component.schema.shortPath} description={component.schema.typePath} open>
      {error !== undefined && (
        <div className="error-card" style={{ color: 'var(--vscode-errorForeground)' }}>
          <p>{error.message}</p>
        </div>
      )}
      <DynamicValue
        path=""
        value={componentValue}
        schema={component.schema}
        onValueChange={(event, rootValue) => {
          setComponentValue(rootValue);
          onValueUpdated(event, component.schema.typePath);
        }}
      />
    </vscode-collapsible>
  );
}

function componentComparator(a: Component, b: Component): number {
  // Errors last.
  if (a.error || b.error) {
    return a.error ? 1 : -1;
  }
  // Sort by typePath.
  if (a.schema.typePath && b.schema.typePath) {
    return a.schema.typePath.localeCompare(b.schema.typePath);
  }
  return 0;
}
