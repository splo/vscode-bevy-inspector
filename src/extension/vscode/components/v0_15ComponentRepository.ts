import type { BevyRemoteService, GetParams } from '../../../brp/brp-0.15';
import type { TypePath } from '../../../brp/types';
import type { BevyJsonSchemaDefinition, TypedValue } from '../../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import type { ComponentRepository } from './components';

export class V0_15ComponentRepository implements ComponentRepository {
  brp: BevyRemoteService;

  constructor(brp: BevyRemoteService) {
    this.brp = brp;
  }

  async listEntityComponents(entity: EntityNode): Promise<TypedValue[]> {
    const params: GetParams = {
      entity: entity.id,
      components: entity.componentNames,
    };
    const result = await this.brp.get(params);
    const valuedComponents: TypedValue[] = Object.entries(result.components).map(([typePath, value]) => {
      return {
        value,
        schema: this.getTypeSchema(typePath),
      };
    });
    const erroneousComponents: TypedValue[] = Object.entries(result.errors).map(([typePath, error]) => {
      return {
        value: undefined,
        error: error.message,
        schema: this.getTypeSchema(typePath),
      };
    });
    return valuedComponents.concat(erroneousComponents);
  }

  async setComponentValue(): Promise<void> {
    throw new Error('Unsupported operation: setComponentValue');
  }

  getTypeSchema(typePath: TypePath): BevyJsonSchemaDefinition {
    return {
      typePath,
    } as BevyJsonSchemaDefinition;
  }
}
