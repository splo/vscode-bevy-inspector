import type { EntityRef, TypePath, EntityId, Entity, Resource } from '@bevy-inspector/inspector-data/types';

/** Repository interface for retrieving and modifying resources and entities. */
export interface InspectorRepository {
  listEntityRefs(): Promise<EntityRef[]>;
  listResourceNames(): Promise<TypePath[]>;
  getEntity(entityId: EntityId): Promise<Entity>;
  getResource(typePath: TypePath): Promise<Resource>;
  spawnEntity(): Promise<EntityId>;
  destroyEntity(entityId: EntityId): Promise<void>;
  reparentEntity(entityId: EntityId, parentId?: EntityId): Promise<void>;
  insertComponent(entityId: EntityId, typePath: TypePath, value: unknown): Promise<void>;
  setComponentValue(entityId: EntityId, typePath: TypePath, value: unknown): Promise<void>;
  removeComponent(entityId: EntityId, typePath: TypePath): Promise<void>;
  insertResource(typePath: TypePath, value: unknown): Promise<void>;
  setResourceValue(typePath: TypePath, value: unknown): Promise<void>;
  removeResource(typePath: TypePath): Promise<void>;
}
