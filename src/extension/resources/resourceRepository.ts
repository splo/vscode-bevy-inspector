import type {
  BrpError,
  GetResourceParams,
  InsertResourceParams,
  MutateResourceParams,
  TypePath,
} from '../../brp/brp-0.18';
import type { TypedValue } from '../../inspector-data/types';
import type { BrpAdapter } from '../brp/adapter';
import type { SchemaService } from '../schemas/schemas';

export class ResourceRepository {
  private brp: BrpAdapter;
  private schemaService: SchemaService;

  constructor(brp: BrpAdapter, schemaService: SchemaService) {
    this.brp = brp;
    this.schemaService = schemaService;
  }

  async listResources(): Promise<TypedValue[]> {
    const resourceTypePaths = await this.brp.listResources();
    const resources: TypedValue[] = await Promise.all(
      resourceTypePaths.map(async (typePath) => {
        try {
          const params: GetResourceParams = { resource: typePath };
          const result = await this.brp.getResource(params);
          return {
            value: result.value,
            schema: await this.schemaService.getTypeSchema(typePath),
          };
        } catch (error) {
          return {
            value: undefined,
            error: (error as BrpError)?.message ?? `Error getting resource: ${error}`,
            schema: await this.schemaService.getTypeSchema(typePath),
          };
        }
      }),
    );
    return resources;
  }

  async listTypePaths(): Promise<TypePath[]> {
    const registry = await this.brp.registrySchema();
    return Object.keys(registry);
  }

  async insertResource(typePath: string, value: unknown): Promise<void> {
    const params: InsertResourceParams = {
      resource: typePath,
      value,
    };
    await this.brp.insertResource(params);
  }

  async setResourceValue(typePath: string, path: string, value: unknown): Promise<void> {
    const params: MutateResourceParams = {
      resource: typePath,
      path,
      value,
    };
    await this.brp.mutateResource(params);
  }
}
