import { useEffect } from 'react';
import { vscodeMessenger } from './vscodeMessenger';

export function usePublisher(type: string, data: unknown): void {
  useEffect(() => {
    if (data !== undefined) {
      vscodeMessenger.publishEvent({ type, data });
    }
  }, [type, data]);
}
