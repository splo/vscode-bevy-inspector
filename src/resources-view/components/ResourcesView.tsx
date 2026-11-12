import type { CollapsibleStateData, SchemaUpdatedData, ValuesUpdatedData } from '../../inspector-data/messages';
import { SchemaUpdated, SetCollapsibleState, ValuesUpdated, ViewReady } from '../../inspector-data/messages';
import { usePublisher } from '../../messenger/usePublisher';
import { useSubscriber } from '../../messenger/useSubscriber';
import { TypedValueDetails } from '../../schema-components/TypedValueDetails';
import { useSchemaResolver } from '../../schema-components/useSchemaResolver';

export function ResourcesView() {
  const resources = useSubscriber<ValuesUpdatedData>(ValuesUpdated);
  const schema = useSubscriber<SchemaUpdatedData>(SchemaUpdated);
  const schemaResolver = useSchemaResolver(schema);
  const collapsibleState = useSubscriber<CollapsibleStateData>(SetCollapsibleState);
  usePublisher(ViewReady, null);

  if (!resources || !schemaResolver) {
    return <p>Loading...</p>;
  }
  return (
    <>
      {resources.map((resource) => (
        <TypedValueDetails
          key={resource.schema.typePath}
          typedValue={schemaResolver(resource)}
          collapsibleState={collapsibleState}
        />
      ))}
    </>
  );
}
