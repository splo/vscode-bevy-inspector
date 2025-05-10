import type { BevyRemoteService, GetParams } from '../../brp/brp-0.15';
import type { BevyJsonSchemaDefinition, TypedValue, TypePath } from '../../inspector-data/types';
import type { EntityNode } from '../entities/entityTree';
import type { ReflectionSchemaService } from '../schemas/reflectionSchemaService';
import type { ComponentRepository } from './components';

export class V0_15ComponentRepository implements ComponentRepository {
  brp: BevyRemoteService;
  schemaService: ReflectionSchemaService;

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
      Object.entries(result.components).map(async ([typePath, value]) => ({
        value,
        schema: await this.schemaService.createTypeSchema(typePath, value),
      })),
    );
    const erroneousComponents: TypedValue[] = await Promise.all(
      Object.entries(result.errors).map(async ([typePath, error]) => ({
        value: undefined,
        error: error.message,
        schema: await this.schemaService.createTypeSchema(typePath, undefined),
      })),
    );
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
