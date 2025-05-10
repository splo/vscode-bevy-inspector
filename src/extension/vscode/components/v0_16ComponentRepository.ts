import type { BevyRemoteService, GetParams, MutateComponentParams } from '../../../brp/brp-0.16';
import type { EntityId, TypePath } from '../../../brp/types';
import type { TypedValue } from '../../../inspector-data/types';
import type { TypeSchemaService } from '../../brp/typeSchemaService';
import type { EntityNode } from '../entities/entityTree';
import type { ComponentRepository } from './components';

export class V0_16ComponentRepository implements ComponentRepository {
  brp: BevyRemoteService;
  typeSchemaService: TypeSchemaService;

  constructor(brp: BevyRemoteService, typeSchemaService: TypeSchemaService) {
    this.brp = brp;
    this.typeSchemaService = typeSchemaService;
  }

  async listEntityComponents(entity: EntityNode): Promise<TypedValue[]> {
    const params: GetParams = {
      entity: entity.id,
      components: entity.componentNames,
    };
    const result = await this.brp.get(params);
    const valuedComponents: TypedValue[] = await Promise.all(
      Object.entries(result.components).map(async ([typePath, value]) => {
        return {
          value,
          schema: await this.typeSchemaService.getTypeSchema(typePath, async () => await this.brp.registrySchema()),
        };
      }),
    );
    const erroneousComponents: TypedValue[] = await Promise.all(
      Object.entries(result.errors).map(async ([typePath, error]) => {
        return {
          value: undefined,
          error: error.message,
          schema: await this.typeSchemaService.getTypeSchema(typePath, async () => await this.brp.registrySchema()),
        };
      }),
    );
    return valuedComponents.concat(erroneousComponents);
  }

  async setComponentValue(entityId: EntityId, typePath: TypePath, path: string, value: unknown): Promise<void> {
    const params: MutateComponentParams = {
      entity: entityId,
      component: typePath,
      path,
      value,
    };
    await this.brp.mutateComponent(params);
  }
}
