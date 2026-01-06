import type { CollapsibleStateData, ValuesUpdatedData } from '../../inspector-data/messages';
import { SetCollapsibleState, ValuesUpdated, ViewReady } from '../../inspector-data/messages';
import { usePublisher } from '../../messenger/usePublisher';
import { useSubscriber } from '../../messenger/useSubscriber';
import { EmptyDetails } from './EmptyDetails';
import { TypedValueDetails } from '../../schema-components/TypedValueDetails';

export function ComponentsView() {
  const components = useSubscriber<ValuesUpdatedData>(ValuesUpdated);
  const collapsibleState = useSubscriber<CollapsibleStateData>(SetCollapsibleState);
  usePublisher(ViewReady, null);

  if (!components) {
    return <EmptyDetails />;
  }
  return (
    <>
      {components.map((component) => (
        <TypedValueDetails key={component.schema.typePath} typedValue={component} collapsibleState={collapsibleState} />
      ))}
    </>
  );
}
