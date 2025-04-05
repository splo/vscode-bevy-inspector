import type { InspectorRepository } from '../inspectorRepository';
import type { Entity, EntityId, EntityRef, Resource, TypePath } from '@bevy-inspector/inspector-data/types';

export class CachedInspectorRepository implements InspectorRepository {
  private liveRepository: InspectorRepository;
  private entityRefsCache: EntityRef[] | null = null;
  private entitiesCache = new Map<EntityId, Entity>();
  private resourceNamesCache: TypePath[] | null = null;
  private resourcesCache = new Map<TypePath, Resource>();

  constructor(liveRepository: InspectorRepository) {
    this.liveRepository = liveRepository;
  }

  public invalidateCache() {
    this.entityRefsCache = null;
    this.resourceNamesCache = null;
    this.entitiesCache.clear();
    this.resourcesCache.clear();
  }

  public invalidateEntityCache(...entityIds: EntityId[]) {
    this.entityRefsCache = null;
    entityIds.forEach((entityId) => this.entitiesCache.delete(entityId));
  }

  public invalidateResourceCache(...typePaths: TypePath[]) {
    this.resourceNamesCache = null;
    typePaths.forEach((typePath) => this.resourcesCache.delete(typePath));
  }

  async listEntityRefs(): Promise<EntityRef[]> {
    if (!this.entityRefsCache) {
      console.debug('Cache miss for entity refs');
      this.entityRefsCache = await this.liveRepository.listEntityRefs();
    } else {
      console.debug('Cache hit for entity refs');
    }
    return this.entityRefsCache;
  }

  async listResourceNames(): Promise<TypePath[]> {
    if (!this.resourceNamesCache) {
      console.debug('Cache miss for resource names');
      this.resourceNamesCache = await this.liveRepository.listResourceNames();
    } else {
      console.debug('Cache hit for resource names');
    }
    return this.resourceNamesCache;
  }

  async getEntity(entityId: EntityId): Promise<Entity> {
    if (!this.entitiesCache.has(entityId)) {
      console.debug(`Cache miss for entity ${entityId}`);
      const entity = await this.liveRepository.getEntity(entityId);
      this.entitiesCache.set(entityId, entity);
    } else {
      console.debug(`Cache hit for entity ${entityId}`);
    }
    return this.entitiesCache.get(entityId)!;
  }

  async getResource(typePath: TypePath): Promise<Resource> {
    if (!this.resourcesCache.has(typePath)) {
      console.debug(`Cache miss for resource ${typePath}`);
      const resource = await this.liveRepository.getResource(typePath);
      this.resourcesCache.set(typePath, resource);
    } else {
      console.debug(`Cache hit for resource ${typePath}`);
    }
    return this.resourcesCache.get(typePath)!;
  }

  async spawnEntity(): Promise<EntityId> {
    this.invalidateEntityCache();
    return await this.liveRepository.spawnEntity();
  }

  async destroyEntity(entityId: EntityId): Promise<void> {
    this.invalidateEntityCache(entityId);
    return await this.liveRepository.destroyEntity(entityId);
  }

  async reparentEntity(entityId: EntityId, parentId?: EntityId): Promise<void> {
    this.invalidateEntityCache(...(parentId === undefined ? [entityId] : [entityId, parentId]));
    return await this.liveRepository.reparentEntity(entityId, parentId);
  }

  async insertComponent(entityId: EntityId, typePath: TypePath, value: unknown): Promise<void> {
    this.invalidateEntityCache(entityId);
    return await this.liveRepository.insertComponent(entityId, typePath, value);
  }

  async setComponentValue(entityId: EntityId, typePath: TypePath, value: unknown): Promise<void> {
    this.invalidateEntityCache(entityId);
    return await this.liveRepository.setComponentValue(entityId, typePath, value);
  }

  async removeComponent(entityId: EntityId, typePath: TypePath): Promise<void> {
    this.invalidateEntityCache(entityId);
    return await this.liveRepository.removeComponent(entityId, typePath);
  }

  async insertResource(typePath: TypePath, value: unknown): Promise<void> {
    this.invalidateResourceCache(typePath);
    return await this.liveRepository.insertResource(typePath, value);
  }

  async setResourceValue(typePath: TypePath, value: unknown): Promise<void> {
    this.invalidateResourceCache(typePath);
    return await this.liveRepository.setResourceValue(typePath, value);
  }

  async removeResource(typePath: TypePath): Promise<void> {
    this.invalidateResourceCache(typePath);
    return await this.liveRepository.removeResource(typePath);
  }
}
