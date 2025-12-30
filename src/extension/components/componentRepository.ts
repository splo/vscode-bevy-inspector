import type { GetParams, InsertParams, MutateComponentParams } from '../../brp/brp-0.17';
import type { EntityId, TypedValue, TypePath } from '../../inspector-data/types';
import type { BrpAdapter } from '../brp/adapter';
import type { EntityNode } from '../entities/entityTree';
import type { SchemaService } from '../schemas/schemas';

export class ComponentRepository {
  private brp: BrpAdapter;
  private schemaService: SchemaService;

  constructor(brp: BrpAdapter, schemaService: SchemaService) {
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
        schema: await this.schemaService.getTypeSchema(typePath, value),
      })),
    );
    const erroneousComponents: TypedValue[] = await Promise.all(
      Object.entries(result.errors).map(async ([typePath, error]) => ({
        value: undefined,
        error: error.message,
        schema: await this.schemaService.getTypeSchema(typePath),
      })),
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

  async listTypePaths(): Promise<TypePath[]> {
    const registry = await this.brp.registrySchema();
    return Object.keys(registry);
  }

  async insertComponent(entityId: EntityId, typePath: TypePath, value: unknown): Promise<void> {
    const params: InsertParams = {
      entity: entityId,
      components: {
        [typePath]: value,
      },
    };
    await this.brp.insert(params);
  }
}
