import type { BevyRemoteService, EntityId, TypePath } from '../../brp/brp-0.18';

export interface BrpAdapter extends BevyRemoteService {
  /** The supported Bevy version. */
  readonly bevyVersion: string;
  /** Whether the adapter supports resources. */
  readonly supportsResources: boolean;
  /** Whether the adapter supports registry. */
  readonly supportsRegistry: boolean;
  /** The TypePath for the name component. */
  readonly nameTypePath: TypePath;
  /** The TypePath for the parent component. */
  readonly parentTypePath: TypePath;
  /** Extracts the name string from a name component value. */
  nameFromNameComponent: (value: unknown) => string | undefined;
  /** Extracts the parent EntityId from a parent component value. */
  parentIdFromParentComponent: (value: unknown) => EntityId | undefined;
}
