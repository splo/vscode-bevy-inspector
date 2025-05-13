import type { BevyRemoteService, BrpSchema } from '../../brp/brp-0.16';
import type { RegistryRepository } from './schemas';

export class BrpRegistryRepository implements RegistryRepository {
  private brp: BevyRemoteService;

  constructor(brp: BevyRemoteService) {
    this.brp = brp;
  }

  async registry(): Promise<BrpSchema[]> {
    return Object.values(await this.brp.registrySchema());
  }
}
