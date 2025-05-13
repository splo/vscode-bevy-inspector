import { useEffect, useState } from 'react';
import type { EventMessage } from '../inspector-data/types';
import { vscodeMessenger } from './vscodeMessenger';

export function useSubscriber<T>(type: string) {
  const [eventData, setEventData] = useState<T>();
  useEffect(() => {
    const handler = (event: EventMessage<T>) => setEventData(event.data);
    const unsubscribe = vscodeMessenger.subscribeToEvent<T>(type, handler);
    return unsubscribe;
  }, [type]);
  return eventData;
}
