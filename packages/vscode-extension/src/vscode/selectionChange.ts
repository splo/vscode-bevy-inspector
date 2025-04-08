import type { EntityId, TypePath } from '@bevy-inspector/inspector-data/types';

export type SelectionChange =
  | { type: 'NonInspectable' }
  | { type: 'Resource'; typePath: TypePath }
  | { type: 'Entity'; entityId: EntityId };
