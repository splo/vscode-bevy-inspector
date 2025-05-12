import type { BevyRemoteService, GetParams } from '../../brp/brp-0.15';
import type { TypedValue } from '../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import type { ReflectionSchemaService } from '../schemas/reflectionSchemaService';
import type { ComponentRepository } from './components';

export class V0_15ComponentRepository implements ComponentRepository {
  private brp: BevyRemoteService;
  private schemaService: ReflectionSchemaService;

  constructor(brp: BevyRemoteService, schemaService: ReflectionSchemaService) {
    this.brp = brp;
    this.schemaService = schemaService;
  }

  async listEntityComponents(entity: EntityNode): Promise<TypedValue[]> {
    const params: GetParams = {
      entity: entity.id,
      components: entity.componentNames,
    };
    const result = await this.brp.get(params);
    const valuedComponents: TypedValue[] = await Promise.all(
      Object.entries(result.components).map(([typePath, value]) => ({
        value,
        schema: this.schemaService.createTypeSchema(typePath, value),
      })),
    );
    const erroneousComponents: TypedValue[] = await Promise.all(
      Object.entries(result.errors).map(([typePath, error]) => ({
        value: undefined,
        error: error.message,
        schema: this.schemaService.createTypeSchema(typePath, undefined),
      })),
    );
    return valuedComponents.concat(erroneousComponents);
  }

  async setComponentValue(): Promise<void> {
    throw new Error("Bevy 0.15.x doesn't support setting component values");
  }
}
