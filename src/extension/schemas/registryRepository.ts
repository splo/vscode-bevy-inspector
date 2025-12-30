import type { BrpSchema } from '../../brp/brp-0.18';
import type { BrpAdapter } from '../brp/adapter';

export class RegistryRepository {
  private brp: BrpAdapter;

  constructor(brp: BrpAdapter) {
    this.brp = brp;
  }

  async registry(): Promise<BrpSchema[]> {
    return Object.values(await this.brp.registrySchema());
  }
}
