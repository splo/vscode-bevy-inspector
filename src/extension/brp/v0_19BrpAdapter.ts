import type { EntityId } from '../../brp/brp-0.19';
import { V0_19BevyRemoteService } from '../../brp/http/v0_19BevyRemoteService';
import type { BrpAdapter } from './adapter';

export class V0_19BrpAdapter extends V0_19BevyRemoteService implements BrpAdapter {
  public constructor(url: string, logger: (message: string, ...args: unknown[]) => void) {
    super(url, logger);
  }
  public readonly bevyVersion = '0.19';
  public readonly supportsResources = true;
  public readonly supportsRegistry = true;
  public readonly nameTypePath = 'bevy_ecs::name::Name';
  public readonly parentTypePath = 'bevy_ecs::hierarchy::ChildOf';

  public nameFromNameComponent(value: unknown): string | undefined {
    type NameComponent = string;
    return value as NameComponent | undefined;
  }

  public parentIdFromParentComponent(value: unknown): EntityId | undefined {
    type ChildOfComponent = EntityId;
    return value as ChildOfComponent | undefined;
  }
}
