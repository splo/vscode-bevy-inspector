import {
  SetComponentValue,
  SetComponentValueRequestData,
  SetComponentValueResponseData,
} from '@bevy-inspector/inspector-data/messages';
import { Component, Entity, TypePath } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-container';
import '@vscode-elements/elements/dist/vscode-form-group';
import { useEffect, useId, useState } from 'react';
import { useRequest } from '../useRequest';
import { ErrorCard } from './ErrorCard';
import { DynamicValue } from './values/DynamicValue';
import { ValueUpdated } from './values/valueProps';

interface EntityProps {
  entity: Entity;
}

export function EntityDetails({ entity }: EntityProps) {
  const [requestData, setRequestData] = useState<SetComponentValueRequestData>();
  const { response, error } = useRequest<SetComponentValueResponseData>(SetComponentValue, requestData);

  console.debug('Rendering EntityDetails', { entity, requestData, response, error });

  if (response) {
    if (!response.success || error) {
      const errorMessage = response?.error || (error as string) || `Error while saving value: ${requestData?.newValue}`;
      return (
        <ErrorCard
          message={errorMessage}
          title={requestData?.typePath ?? ''}
          description={requestData?.typePath ?? ''}
          open
        />
      );
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
      <ComponentList key={entity.id} components={entity.components} onValueUpdated={onValueUpdated} />
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

type ComponentListProps = {
  components: Component[];
  onValueUpdated: (event: ValueUpdated, typePath: TypePath) => void;
};

function ComponentList({ components, onValueUpdated }: ComponentListProps) {
  const [componentValues, setComponentValues] = useState(components.map((component) => component.value));
  useEffect(() => {
    setComponentValues(components.map((component) => component.value));
  }, [components]);
  return components.sort(componentComparator).map((component, index) => {
    return (
      <vscode-collapsible key={index} title={component.schema.shortPath} description={component.schema.typePath} open>
        <DynamicValue
          path=""
          value={componentValues[index]}
          schema={component.schema}
          onValueChange={(event, rootValue) => {
            const updatedValues = [...componentValues];
            updatedValues[index] = rootValue;
            setComponentValues(updatedValues);
            onValueUpdated(event, component.schema.typePath);
          }}
        />
      </vscode-collapsible>
    );
  });
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
