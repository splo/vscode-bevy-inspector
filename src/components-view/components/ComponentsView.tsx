import type { CollapsibleStateData, SchemaUpdatedData, ValuesUpdatedData } from '../../inspector-data/messages';
import { SchemaUpdated, SetCollapsibleState, ValuesUpdated, ViewReady } from '../../inspector-data/messages';
import { usePublisher } from '../../messenger/usePublisher';
import { useSubscriber } from '../../messenger/useSubscriber';
import { EmptyDetails } from './EmptyDetails';
import { TypedValueDetails } from '../../schema-components/TypedValueDetails';
import { useSchemaResolver } from '../../schema-components/useSchemaResolver';

export function ComponentsView() {
  const components = useSubscriber<ValuesUpdatedData>(ValuesUpdated);
  const schema = useSubscriber<SchemaUpdatedData>(SchemaUpdated);
  const schemaResolver = useSchemaResolver(schema);
  const collapsibleState = useSubscriber<CollapsibleStateData>(SetCollapsibleState);
  usePublisher(ViewReady, null);

  if (!components || !schemaResolver) {
    return <EmptyDetails />;
  }
  return (
    <>
      {components.map((component) => (
        <TypedValueDetails
          key={component.schema.typePath}
          typedValue={schemaResolver(component)}
          collapsibleState={collapsibleState}
        />
      ))}
    </>
  );
}
