import { SelectionChanged, SelectionChangedData } from '@bevy-inspector/inspector-data/messages';
import { ComponentDetails } from './components/ComponentDetails';
import { EmptyDetails } from './components/EmptyDetails';
import { EntityDetails } from './components/EntityDetails';
import { useEvent } from './useEvent';

export function SelectionView() {
  const selectionChanged = useEvent<SelectionChangedData>(SelectionChanged);
  switch (selectionChanged?.type) {
    case undefined:
    case 'NonInspectable':
      return <EmptyDetails />;
    case 'Resource':
      return <ComponentDetails entityId={0} component={selectionChanged.resource} />;
    case 'Entity':
      return <EntityDetails entity={selectionChanged.entity} />;
  }
}
