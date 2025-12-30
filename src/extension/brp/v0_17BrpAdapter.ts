import type { EntityId } from '../../brp/brp-0.17';
import { V0_17BevyRemoteService } from '../../brp/http/v0_17BevyRemoteService';
import type { BrpAdapter } from './adapter';

export class V0_17BrpAdapter extends V0_17BevyRemoteService implements BrpAdapter {
  public constructor(url: string, logger: (message: string, ...args: unknown[]) => void) {
    super(url, logger);
  }
  public readonly bevyVersion = '0.17';
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
