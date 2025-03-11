import { EntitySelectedData, InspectorMessage } from '@bevy-inspector/inspector-messages';
import { EmptyDetails } from './components/EmptyDetails';
import { EntityDetails } from './components/EntityDetails';
import { useEvent } from './useEvent';

export function SelectionView() {
  const entitySelected = useEvent<EntitySelectedData>(InspectorMessage.EntitySelected);
  if (!entitySelected) {
    return <EmptyDetails />;
  } else {
    return <EntityDetails entity={entitySelected.entity} />;
  }
}
