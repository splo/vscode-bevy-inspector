import type { SelectionChangedData } from '../inspector-data/messages';
import { SelectionChanged } from '../inspector-data/messages';
import { EmptyDetails } from './components/EmptyDetails';
import { EntityDetails } from './components/EntityDetails';
import { ResourceDetails } from './components/ResourceDetails';
import { useEvent } from './useEvent';

export function SelectionView() {
  const selectionChanged = useEvent<SelectionChangedData>(SelectionChanged);
  switch (selectionChanged?.type) {
    case undefined:
    case 'NonInspectable':
      return <EmptyDetails />;
    case 'Resource':
      return <ResourceDetails resource={selectionChanged.resource} />;
    case 'Entity':
      return <EntityDetails entity={selectionChanged.entity} />;
  }
}
