import type { BevyRemoteService, BrpError, GetResourceParams, MutateResourceParams } from '../../../brp/brp-0.16';
import type { TypedValue } from '../../../inspector-data/types';
import type { TypeSchemaService } from '../../brp/typeSchemaService';
import type { ResourceRepository } from './resources';

export class V0_16ResourceRepository implements ResourceRepository {
  brp: BevyRemoteService;
  typeSchemaService: TypeSchemaService;

  constructor(brp: BevyRemoteService, typeSchemaService: TypeSchemaService) {
    this.brp = brp;
    this.typeSchemaService = typeSchemaService;
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
            schema: await this.typeSchemaService.getTypeSchema(typePath, async () => await this.brp.registrySchema()),
          };
        } catch (error) {
          return {
            value: undefined,
            error: (error as BrpError)?.message ?? `Error getting resource: ${error}`,
            schema: await this.typeSchemaService.getTypeSchema(typePath, async () => await this.brp.registrySchema()),
          };
        }
      }),
    );
    return resources;
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
