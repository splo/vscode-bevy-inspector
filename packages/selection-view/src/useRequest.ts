import { useEffect, useState } from 'react';
import { messenger } from './vscodeMessenger';

export function useRequest<T>(type: string, data: unknown | undefined) {
  const [response, setResponse] = useState<T>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    if (data !== undefined) {
      messenger.sendRequest<T>(type, data).then(setResponse).catch(setError);
    }
  }, [type, data]);

  return { response, error };
}
