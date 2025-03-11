import {
  Entity,
  InspectorMessage,
  ListComponentsRequestData,
  ListComponentsResponseData,
} from '@bevy-inspector/inspector-messages';
import '@vscode-elements/elements/dist/vscode-form-container';
import '@vscode-elements/elements/dist/vscode-form-group';
import { useId, useMemo } from 'react';
import { useRequest } from '../useRequest';
import { ComponentDetails } from './ComponentDetails';
import { ErrorCard } from './ErrorCard';

interface EntityProps {
  entity: Entity;
}

export function EntityDetails({ entity }: EntityProps) {
  const id = useId().replace(/:/g, ''); // useId() wraps generated string with ":" which is not suitable for HTML IDs.
  const data: ListComponentsRequestData = useMemo(
    () => ({
      entityId: entity.id,
    }),
    [entity.id],
  );
  const { response, error } = useRequest<ListComponentsResponseData>(InspectorMessage.ListComponents, data);

  const name = entity.name ?? entity.id.toString();
  return (
    <vscode-form-container>
      <h2 style={{ width: '100%', textAlign: 'center' }}>{name}</h2>
      <vscode-form-group variant="horizontal">
        <vscode-label htmlFor={id}>ID</vscode-label>
        <vscode-textfield id={id} type="number" readonly value={entity.id.toString()}></vscode-textfield>
      </vscode-form-group>
      <ComponentList components={response?.components || []} />
      {error ? <ErrorCard error={error.toString()} /> : null}
    </vscode-form-container>
  );
}

function ComponentList({ components }: ListComponentsResponseData) {
  return components?.map((component) => <ComponentDetails key={component.typePath} component={component} />);
}
