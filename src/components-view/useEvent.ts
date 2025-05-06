import { useEffect, useState } from 'react';
import { messenger } from './vscodeMessenger';

export function useEvent<T>(type: string) {
  const [eventData, setEventData] = useState<T>();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<T>;
      setEventData(customEvent.detail);
    };

    messenger.addEventListener(type, handler);

    return () => messenger.removeEventListener(type, handler);
  }, [type]);

  return eventData;
}
