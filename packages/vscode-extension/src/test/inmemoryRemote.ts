/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  BevyDestroyParams,
  BevyDestroyResult,
  BevyGetLenientResult,
  BevyGetParams,
  BevyGetResourceParams,
  BevyGetResourceResult,
  BevyGetResult,
  BevyGetStrictResult,
  BevyGetWatchParams,
  BevyGetWatchResult,
  BevyInsertParams,
  BevyInsertResourceParams,
  BevyInsertResourceResult,
  BevyInsertResult,
  BevyListParams,
  BevyListResourcesParams,
  BevyListResourcesResult,
  BevyListResult,
  BevyListWatchParams,
  BevyListWatchResult,
  BevyMutateComponentParams,
  BevyMutateComponentResult,
  BevyMutateResourceParams,
  BevyMutateResourceResult,
  BevyQueryParams,
  BevyQueryResult,
  BevyRegistrySchemaParams,
  BevyRegistrySchemaResult,
  BevyRemoteService,
  BevyRemoveParams,
  BevyRemoveResourceParams,
  BevyRemoveResourceResult,
  BevyRemoveResult,
  BevyReparentParams,
  BevyReparentResult,
  BevySpawnParams,
  BevySpawnResult,
  EntityId,
  RpcDiscoverParams,
  RpcDiscoverResult,
  SchemaType,
  TypePath,
} from '../brp';

export class InMemoryBevyRemoteService implements BevyRemoteService {
  public entities = new Map<EntityId, Record<TypePath, unknown>>();
  public nextEntityId: EntityId = 1;

  async get(params: BevyGetParams): Promise<BevyGetResult> {
    const { entity, components, strict } = params;
    const entityComponents = this.entities.get(entity);
    if (!entityComponents) {
      throw new Error(`Entity ${entity} not found`);
    }

    if (strict) {
      const result: BevyGetStrictResult = {};
      for (const component of components) {
        if (!(component in entityComponents)) {
          throw new Error(`Component ${component} not found on entity ${entity}`);
        }
        result[component] = entityComponents[component];
      }
      return result;
    }

    const lenientResult: BevyGetLenientResult = {
      components: {},
      errors: {},
    };
    for (const component of components) {
      if (component in entityComponents) {
        lenientResult.components[component] = entityComponents[component];
      } else {
        lenientResult.errors[component] = { message: `Component ${component} not found` };
      }
    }
    return lenientResult;
  }

  async query(params: BevyQueryParams): Promise<BevyQueryResult> {
    const { data, filter } = params;
    const components = data?.components || [];
    const option = data?.option || [];
    const has = data?.has || [];
    const filterWith = filter?.with || [];
    const filterWithout = filter?.without || [];

    const results: BevyQueryResult = [];

    this.entities.forEach((entityComponents, entity) => {
      // Check if the entity satisfies the filter conditions
      if (
        filterWith.some((component) => !(component in entityComponents)) ||
        filterWithout.some((component) => component in entityComponents)
      ) {
        return;
      }

      // Fetch the required components and optionally fetch others
      const resultComponents: Record<TypePath, unknown> = {};
      for (const component of components) {
        if (component in entityComponents) {
          resultComponents[component] = entityComponents[component];
        }
      }
      for (const component of option) {
        if (component in entityComponents) {
          resultComponents[component] = entityComponents[component];
        }
      }

      // Determine the presence of components in the 'has' list
      const hasResult: Record<TypePath, boolean> = {};
      if (has.length > 0) {
        for (const component of has) {
          hasResult[component] = component in entityComponents;
        }
      }

      // Include the entity in the results
      const result: {
        entity: EntityId;
        components: Record<TypePath, unknown>;
        has?: Record<TypePath, boolean>;
      } = {
        entity,
        components: resultComponents,
      };

      if (has.length > 0) {
        result.has = hasResult;
      }

      results.push(result);
    });

    return results;
  }

  async spawn(params: BevySpawnParams): Promise<BevySpawnResult> {
    const entity = this.nextEntityId++;
    this.entities.set(entity, { ...params.components });
    return { entity };
  }

  async destroy(params: BevyDestroyParams): Promise<BevyDestroyResult> {
    this.entities.delete(params.entity);
    return null;
  }

  async remove(params: BevyRemoveParams): Promise<BevyRemoveResult> {
    const entityComponents = this.entities.get(params.entity);
    if (!entityComponents) {
      throw new Error(`Entity ${params.entity} not found`);
    }

    for (const component of Object.keys(params.components)) {
      delete entityComponents[component];
    }
    return null;
  }

  async insert(params: BevyInsertParams): Promise<BevyInsertResult> {
    const entityComponents = this.entities.get(params.entity);
    if (!entityComponents) {
      throw new Error(`Entity ${params.entity} not found`);
    }

    Object.assign(entityComponents, params.components);
    return null;
  }

  async reparent(params: BevyReparentParams): Promise<BevyReparentResult> {
    // TODO: Implement this.
    return null;
  }

  async list(params?: BevyListParams): Promise<BevyListResult> {
    const entityComponents = this.entities.get(params?.entity ?? -1);
    if (!entityComponents) {
      throw new Error(`Entity ${params?.entity} not found`);
    }

    return Object.keys(entityComponents);
  }

  async registrySchema(params?: BevyRegistrySchemaParams): Promise<BevyRegistrySchemaResult> {
    const schemas: BevyRegistrySchemaResult = {};
    Object.values(this.entities)
      .map((entity: Record<string, unknown>) => Object.entries(entity))
      .flat()
      .forEach(([typePath, value]) => {
        let valueType: SchemaType;
        switch (typeof value) {
          case 'number':
            valueType = 'float';
            break;
          case 'string':
            valueType = 'string';
            break;
          case 'boolean':
            valueType = 'boolean';
            break;
          case 'object':
            if (Array.isArray(value)) {
              valueType = 'array';
            } else {
              valueType = 'object';
            }
            break;
          default:
            valueType = 'string';
            break;
        }
        schemas[typePath] = {
          type: valueType,
          kind: 'Value',
          shortPath: typePath.replaceAll(/\w*::/g, ''),
          typePath,
        };
      });
    return schemas;
  }

  async getWatch(params: BevyGetWatchParams): Promise<BevyGetWatchResult> {
    const { entity, components } = params;
    const entityComponents = this.entities.get(entity);
    if (!entityComponents) {
      throw new Error(`Entity ${entity} not found`);
    }

    const result: BevyGetWatchResult = {
      components: {},
      removed: [],
      errors: {},
    };

    for (const component of components) {
      if (component in entityComponents) {
        result.components[component] = entityComponents[component];
      } else {
        result.removed.push(component);
      }
    }
    return result;
  }

  async listWatch(params: BevyListWatchParams): Promise<BevyListWatchResult> {
    const entityComponents = this.entities.get(params.entity);
    if (!entityComponents) {
      throw new Error(`Entity ${params.entity} not found`);
    }
    // TODO: Implement this.
    return { added: [], removed: [] };
  }

  mutateComponent(params: BevyMutateComponentParams): Promise<BevyMutateComponentResult> {
    throw new Error('Method not implemented.');
  }

  getResource(params: BevyGetResourceParams): Promise<BevyGetResourceResult> {
    throw new Error('Method not implemented.');
  }

  insertResource(params: BevyInsertResourceParams): Promise<BevyInsertResourceResult> {
    throw new Error('Method not implemented.');
  }

  removeResource(params: BevyRemoveResourceParams): Promise<BevyRemoveResourceResult> {
    throw new Error('Method not implemented.');
  }

  mutateResource(params: BevyMutateResourceParams): Promise<BevyMutateResourceResult> {
    throw new Error('Method not implemented.');
  }

  listResources(params: BevyListResourcesParams): Promise<BevyListResourcesResult> {
    throw new Error('Method not implemented.');
  }

  discover(params: RpcDiscoverParams): Promise<RpcDiscoverResult> {
    throw new Error('Method not implemented.');
  }
}
