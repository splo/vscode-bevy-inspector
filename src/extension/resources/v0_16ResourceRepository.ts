import type { BevyRemoteService, BrpError, GetResourceParams, MutateResourceParams } from '../../brp/brp-0.16';
import type { TypedValue } from '../../inspector-data/types';
import type { RemoteSchemaService } from '../schemas/remoteSchemaService';
import type { ResourceRepository } from './resources';

export class V0_16ResourceRepository implements ResourceRepository {
  private brp: BevyRemoteService;
  private schemaService: RemoteSchemaService;

  constructor(brp: BevyRemoteService, schemaService: RemoteSchemaService) {
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

  async setResourceValue(typePath: string, path: string, value: unknown): Promise<void> {
    const params: MutateResourceParams = {
      resource: typePath,
      path,
      value,
    };
    await this.brp.mutateResource(params);
  }
}
