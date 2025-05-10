import type { ValuesUpdatedData } from '../inspector-data/messages';
import { ValuesUpdated, ViewReady } from '../inspector-data/messages';
import { EmptyDetails } from './components/EmptyDetails';
import { TypedValueDetails } from './components/TypedValueDetails';
import { useEvent } from './useEvent';
import { useRequest } from './useRequest';

export function ResourcesView() {
  const resources = useEvent<ValuesUpdatedData>(ValuesUpdated);
  useRequest<void>(ViewReady, null);

  if (!resources) {
    return <EmptyDetails />;
  }
  return (
    <>
      {resources.map((resource) => (
        <TypedValueDetails key={resource.schema.typePath} typedValue={resource} />
      ))}
    </>
  );
}
