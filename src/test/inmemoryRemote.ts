import { BevyDestroyParams, BevyDestroyResult, BevyGetLenientResult, BevyGetParams, BevyGetResult, BevyGetStrictResult, BevyGetWatchParams, BevyGetWatchResult, BevyInsertParams, BevyInsertResult, BevyListParams, BevyListResult, BevyListWatchParams, BevyListWatchResult, BevyQueryParams, BevyQueryResult, BevyRemoteService, BevyRemoveParams, BevyRemoveResult, BevyReparentParams, BevyReparentResult, BevySpawnParams, BevySpawnResult, ComponentName, EntityId } from "../brp";

export class InMemoryBevyRemoteService implements BevyRemoteService {
    public entities: Map<EntityId, Record<ComponentName, any>> = new Map();
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
            const resultComponents: Record<ComponentName, any> = {};
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
            const hasResult: Record<ComponentName, boolean> = {};
            if (has.length > 0) {
                for (const component of has) {
                    hasResult[component] = component in entityComponents;
                }
            }

            // Include the entity in the results
            const result: { entity: EntityId; components: Record<ComponentName, any>; has?: Record<ComponentName, boolean> } = {
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
}
