import type { ValuesUpdatedData } from '../inspector-data/messages';
import { ValuesUpdated, ViewReady } from '../inspector-data/messages';
import { EmptyDetails } from './components/EmptyDetails';
import { TypedValueDetails } from './components/TypedValueDetails';
import { useEvent } from './useEvent';
import { useRequest } from './useRequest';

export function ComponentsView() {
  const components = useEvent<ValuesUpdatedData>(ValuesUpdated);
  useRequest<void>(ViewReady, null);

  if (!components) {
    return <EmptyDetails />;
  }
  return (
    <>
      {components.map((component) => (
        <TypedValueDetails key={component.schema.typePath} typedValue={component} />
      ))}
    </>
  );
}
