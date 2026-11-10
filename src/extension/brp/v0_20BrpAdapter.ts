import type { EntityId } from '../../brp/brp-0.20';
import { V0_20BevyRemoteService } from '../../brp/http/v0_20BevyRemoteService';
import type { BrpAdapter } from './adapter';

export class V0_20BrpAdapter extends V0_20BevyRemoteService implements BrpAdapter {
  public readonly bevyVersion = '0.20';
  public readonly supportsResources = true;
  public readonly supportsRegistry = true;
  public readonly nameTypePath = 'bevy_ecs::name::Name';
  public readonly parentTypePath = 'bevy_ecs::hierarchy::ChildOf';

  public nameFromNameComponent(value: unknown): string | undefined {
    return value as string | undefined;
  }

  public parentIdFromParentComponent(value: unknown): EntityId | undefined {
    return value as EntityId | undefined;
  }
}
