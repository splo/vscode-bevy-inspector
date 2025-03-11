import { useEffect, useState } from 'react';
import { messenger } from './vscodeMessenger';

export function useRequest<T>(type: string, data: unknown) {
  const [response, setResponse] = useState<T>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    messenger.sendRequest<T>(type, data).then(setResponse).catch(setError);
  }, [type, data]);

  return { response, error };
}
