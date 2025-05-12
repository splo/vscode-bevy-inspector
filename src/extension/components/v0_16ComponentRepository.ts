import type { BevyRemoteService, GetParams, MutateComponentParams } from '../../brp/brp-0.16';
import type { EntityId, TypedValue, TypePath } from '../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import type { RemoteSchemaService } from '../schemas/remoteSchemaService';
import type { ComponentRepository } from './components';

export class V0_16ComponentRepository implements ComponentRepository {
  private brp: BevyRemoteService;
  private schemaService: RemoteSchemaService;

  constructor(brp: BevyRemoteService, schemaService: RemoteSchemaService) {
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
      Object.entries(result.components).map(async ([typePath, value]) => {
        return {
          value,
          schema: await this.schemaService.getTypeSchema(typePath),
        };
      }),
    );
    const erroneousComponents: TypedValue[] = await Promise.all(
      Object.entries(result.errors).map(async ([typePath, error]) => {
        return {
          value: undefined,
          error: error.message,
          schema: await this.schemaService.getTypeSchema(typePath),
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
