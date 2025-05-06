import type { ResourcesUpdatedData } from '../inspector-data/messages';
import { ResourcesUpdated } from '../inspector-data/messages';
import { EmptyDetails } from './components/EmptyDetails';
import { ResourceDetails } from './components/ResourceDetails';
import { useEvent } from './useEvent';

export function SelectionView() {
  const resourcesUpdated = useEvent<ResourcesUpdatedData>(ResourcesUpdated);
  if (!resourcesUpdated || !resourcesUpdated.resources) {
    return <EmptyDetails />;
  }
  return (
    <>
      {resourcesUpdated.resources.map((resource) => (
        <ResourceDetails key={resource.schema.typePath} resource={resource} />
      ))}
    </>
  );
}
