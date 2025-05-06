import { useEffect, useState } from 'react';
import { messenger } from './vscodeMessenger';

export function useRequest<T>(type: string, data: unknown | undefined) {
  const [response, setResponse] = useState<T>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    try {
      if (data !== undefined) {
        messenger.sendRequest<T>(type, data).then(setResponse).catch(setError);
      }
    } catch (error) {
      setError(error);
    }
  }, [type, data]);

  return { response, error };
}
