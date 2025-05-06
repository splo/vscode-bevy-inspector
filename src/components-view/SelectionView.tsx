import type { EntitySelectedData } from '../inspector-data/messages';
import { EntitySelected } from '../inspector-data/messages';
import { EmptyDetails } from './components/EmptyDetails';
import { EntityDetails } from './components/EntityDetails';
import { useEvent } from './useEvent';

export function SelectionView() {
  const entitySelected = useEvent<EntitySelectedData>(EntitySelected);
  if (!entitySelected) {
    return <EmptyDetails />;
  }
  return <EntityDetails entity={entitySelected.entity} />;
}
