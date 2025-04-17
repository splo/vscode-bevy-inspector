import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';

export interface ValueUpdated {
  path: string;
  value: unknown;
}

export interface ValueProps<T> {
  name?: string;
  path: string;
  value: T;
  schema: BevyJsonSchema;
  readOnly?: boolean;
  onValueChange: (event: ValueUpdated, treeValue: unknown) => void;
}

export interface DynamicValueError {
  path: string;
  message: string;
}
