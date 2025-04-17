import type { Entity, EntityId, EntityRef, Resource, TypePath } from '@bevy-inspector/inspector-data/types';
import type { InspectorRepository } from '../inspectorRepository';
import type {
  BevyDestroyParams,
  BevyGetParams,
  BevyGetResourceParams,
  BevyInsertParams,
  BevyInsertResourceParams,
  BevyListParams,
  BevyMutateComponentParams,
  BevyMutateResourceParams,
  BevyQueryParams,
  BevyRemoteService,
  BevyRemoveParams,
  BevyRemoveResourceParams,
  BevyReparentParams,
  BevySpawnParams,
  Schema,
} from './brp';
import type { TypeSchemaService } from './typeSchemaService';

type NameComponent = string | undefined;
type ChildOfComponent = EntityId | undefined;

export class RemoteInspectorRepository implements InspectorRepository {
  private brp: BevyRemoteService;
  private typeSchemaService: TypeSchemaService;

  constructor(brp: BevyRemoteService, typeSchemaService: TypeSchemaService) {
    this.brp = brp;
    this.typeSchemaService = typeSchemaService;
  }

  async listEntityRefs(): Promise<EntityRef[]> {
    const queryParams: BevyQueryParams = {
      data: { option: ['bevy_ecs::name::Name', 'bevy_ecs::hierarchy::ChildOf'] },
    };
    const queryResult = await this.brp.query(queryParams);
    const entityRefs = Promise.all(
      queryResult.map(async (row) => {
        const componentNames = await this.brp.list({ entity: row.entity });
        const entityRef: EntityRef = {
          id: row.entity,
          name: extractName(row.components, componentNames),
          parentId: row.components['bevy_ecs::hierarchy::ChildOf'] as ChildOfComponent,
          componentNames,
        };
        return entityRef;
      }),
    );
    return entityRefs;
  }

  async listResourceNames(): Promise<TypePath[]> {
    return await this.brp.listResources();
  }

  public async getRegistry(): Promise<Record<TypePath, Schema>> {
    return await this.brp.registrySchema();
  }

  async getEntity(entityId: EntityId): Promise<Entity> {
    const listParams: BevyListParams = { entity: entityId };
    const componentNames = await this.brp.list(listParams);
    const getParams: BevyGetParams = {
      entity: entityId,
      components: componentNames,
    };
    const componentData = await this.brp.get(getParams);
    const components = await Promise.all(
      componentNames.map(async (typePath) => ({
        value: componentData.components[typePath],
        error: componentData.errors[typePath]?.message,
        schema: await this.typeSchemaService.getTypeSchema(typePath, () => this.getRegistry()),
      })),
    );
    return {
      id: entityId,
      name: extractName(componentData.components, componentNames),
      components,
    };
  }

  async getResource(typePath: TypePath): Promise<Resource> {
    const params: BevyGetResourceParams = { resource: typePath };
    const resource = await this.brp.getResource(params);
    const schema = await this.typeSchemaService.getTypeSchema(typePath, () => this.getRegistry());
    return {
      value: resource.value,
      error: resource.error?.message,
      schema,
    };
  }

  async spawnEntity(): Promise<EntityId> {
    const params: BevySpawnParams = {
      components: {},
    };
    const result = await this.brp.spawn(params);
    return result.entity;
  }

  async destroyEntity(entityId: EntityId): Promise<void> {
    const params: BevyDestroyParams = {
      entity: entityId,
    };
    await this.brp.destroy(params);
  }

  async reparentEntity(entityId: EntityId, parentId?: EntityId): Promise<void> {
    const params: BevyReparentParams = {
      entities: [entityId],
      parent: parentId,
    };
    await this.brp.reparent(params);
  }

  async insertComponent(entityId: EntityId, typePath: TypePath, value: unknown): Promise<void> {
    const params: BevyInsertParams = {
      entity: entityId,
      components: {
        [typePath]: value,
      },
    };
    await this.brp.insert(params);
  }

  async setComponentValue(entityId: EntityId, typePath: TypePath, path: string, value: unknown): Promise<void> {
    const params: BevyMutateComponentParams = {
      entity: entityId,
      component: typePath,
      path,
      value,
    };
    await this.brp.mutateComponent(params);
  }

  async removeComponent(entityId: EntityId, typePath: TypePath): Promise<void> {
    const params: BevyRemoveParams = {
      entity: entityId,
      components: [typePath],
    };
    await this.brp.remove(params);
  }

  async insertResource(typePath: TypePath, value: unknown): Promise<void> {
    const params: BevyInsertResourceParams = {
      resource: typePath,
      value,
    };
    await this.brp.insertResource(params);
  }

  async setResourceValue(typePath: TypePath, path: string, value: unknown): Promise<void> {
    const params: BevyMutateResourceParams = {
      resource: typePath,
      path,
      value,
    };
    await this.brp.mutateResource(params);
  }

  async removeResource(typePath: TypePath): Promise<void> {
    const params: BevyRemoveResourceParams = {
      resource: typePath,
    };
    await this.brp.removeResource(params);
  }
}

function extractName(components: Record<TypePath, unknown>, componentNames: TypePath[]): string | undefined {
  const nameComponent = components['bevy_ecs::name::Name'] as NameComponent;
  if (nameComponent) {
    return nameComponent;
  }
  return componentNames.map((typePath) => COMPONENT_NAME_MAPPING[typePath]).find((name) => name !== undefined);
}

const COMPONENT_NAME_MAPPING: Record<TypePath, string> = {
  'bevy_window::window::PrimaryWindow': 'PrimaryWindow',
  'bevy_core_pipeline::core_3d::camera_3d::Camera3d': 'Camera3D',
  'bevy_core_pipeline::core_2d::camera_2d::Camera2d': 'Camera2D',
  'bevy_pbr::light::point_light::PointLight': 'PointLight',
  'bevy_pbr::light::directional_light::DirectionalLight': 'DirectionalLight',
  'bevy_ui::widget::text::Text': 'Text',
  'bevy_ui::ui_node::Node': 'Node',
  'bevy_pbr::mesh_material::MeshMaterial3d<bevy_pbr::mesh_material::StandardMaterial>': 'PbrMesh',
  'bevy_window::window::Window': 'Window',
  'bevy_ecs::observer::runner::ObserverState': 'Observer',
  'bevy_window::monitor::Monitor': 'Monitor',
  'bevy_picking::pointer::PointerId': 'Pointer',
  'bevy_input::gamepad::Gamepad': 'Gamepad',
  'bevy_ecs::system::system_registry::SystemIdMarker': 'System',
};
