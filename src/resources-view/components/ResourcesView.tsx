import type { CollapsibleStateData, ValuesUpdatedData } from '../../inspector-data/messages';
import { SetCollapsibleState, ValuesUpdated, ViewReady } from '../../inspector-data/messages';
import { usePublisher } from '../../messenger/usePublisher';
import { useSubscriber } from '../../messenger/useSubscriber';
import { TypedValueDetails } from '../../schema-components/TypedValueDetails';

export function ResourcesView() {
  const resources = useSubscriber<ValuesUpdatedData>(ValuesUpdated);
  const collapsibleState = useSubscriber<CollapsibleStateData>(SetCollapsibleState);
  usePublisher(ViewReady, null);

  if (!resources) {
    return <p>Loading...</p>;
  }
  return (
    <>
      {resources.map((resource) => (
        <TypedValueDetails key={resource.schema.typePath} typedValue={resource} collapsibleState={collapsibleState} />
      ))}
    </>
  );
}
