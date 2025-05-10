import type { TypePath } from '../../inspector-data/types';

export function shortenTypePath(typePath: TypePath): string {
  return typePath.replaceAll(/\w*::/g, '');
}
