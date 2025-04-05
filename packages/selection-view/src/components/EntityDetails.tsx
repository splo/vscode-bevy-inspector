import { Component, Entity } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-form-container';
import '@vscode-elements/elements/dist/vscode-form-group';
import { useId } from 'react';
import { ComponentDetails } from './ComponentDetails';

interface EntityProps {
  entity: Entity;
}

export function EntityDetails({ entity }: EntityProps) {
  const id = useId().replace(/:/g, ''); // useId() wraps generated string with ":" which is not suitable for HTML IDs.

  const name = entity.name ?? entity.id.toString();
  return (
    <vscode-form-container>
      <h2 style={{ width: '100%', textAlign: 'center' }}>{name}</h2>
      <vscode-form-group variant="horizontal">
        <vscode-label htmlFor={id}>ID</vscode-label>
        <vscode-textfield id={id} type="number" readonly value={entity.id.toString()}></vscode-textfield>
      </vscode-form-group>
      <ComponentList entityId={entity.id} components={entity.components || []} />
    </vscode-form-container>
  );
}

function ComponentList({ entityId, components }: { entityId: number; components: Component[] }) {
  components.sort((a, b) => {
    if (a.error || b.error) {
      return a.error ? 1 : -1;
    }
    if (a.schema?.typePath && b.schema?.typePath) {
      return a.schema.typePath.localeCompare(b.schema.typePath);
    }
    return 0;
  });
  return components?.map((component, index) => <ComponentDetails key={`${entityId}-${index}`} component={component} />);
}
