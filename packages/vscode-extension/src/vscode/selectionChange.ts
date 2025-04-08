import type { EntityId, TypePath } from '@bevy-inspector/inspector-data/types';

export type SelectionChange = NonInspectableSelection | ResourceSelection | EntitySelection;

export interface NonInspectableSelection {
  type: 'NonInspectable';
}
export interface ResourceSelection {
  type: 'Resource';
  typePath: TypePath;
}
export interface EntitySelection {
  type: 'Entity';
  entityId: EntityId;
}
