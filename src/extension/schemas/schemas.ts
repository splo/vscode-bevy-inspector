import type { BrpSchema } from '../../brp/brp-0.16';
import type { TypePath } from '../../inspector-data/types';

export function shortenTypePath(typePath: TypePath): string {
  return typePath.replaceAll(/\w*::/g, '');
}

export interface RegistryRepository {
  registry(): Promise<BrpSchema[]>;
}
