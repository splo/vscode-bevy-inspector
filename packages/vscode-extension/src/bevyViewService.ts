/* eslint-disable @typescript-eslint/no-explicit-any */
import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import type {
  BevyGetLenientResult,
  BevyMutateComponentParams,
  BevyRegistrySchemaResult,
  BevyRemoteService,
  Schema as BrpSchema,
  EntityId,
  Reference,
  TypePath,
} from './brp';

// Resources, assets, etc. are not yet supported by the official BRP plugin.
export enum CategoryType {
  Schema,
  Entities,
}

export class Category {
  type: CategoryType;

  constructor(type: CategoryType) {
    this.type = type;
  }
}

export class Schema {
  name: string;
  typePath: TypePath;
  kind: string;

  constructor(name: string, typePath: TypePath, kind: string) {
    this.name = name;
    this.typePath = typePath;
    this.kind = kind;
  }
}

export class Entity {
  id: EntityId;
  name?: string;
  parentId?: EntityId;

  constructor(id: EntityId, name?: string, parentId?: EntityId) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
  }
}

export class Component {
  name: TypePath;
  value?: any;
  errorMessage?: string;

  constructor(name: string, value?: any, errorMessage?: string) {
    this.name = name;
    this.value = value;
    this.errorMessage = errorMessage;
  }
}

export class ComponentValue {
  name: string | null;
  value: any;
  hasError: boolean;
  children: ComponentValue[];

  constructor(name: string | null, value: any, children?: ComponentValue[], hasError?: boolean) {
    this.name = name;
    this.value = value;
    this.hasError = hasError || false;
    this.children = children || [];
  }
}

export type BevyVersion = '0.15' | '0.16';

export class BevyTreeService {
  public static DEFAULT_BEVY_VERSION: BevyVersion = '0.15';

  public bevyVersion: BevyVersion = BevyTreeService.DEFAULT_BEVY_VERSION;
  private remoteService: BevyRemoteService;
  private schema?: JSONSchema7;
  private entities?: Entity[];
  private components = new Map<EntityId, Component[]>();

  constructor(remoteService: BevyRemoteService) {
    this.remoteService = remoteService;
  }

  public async destroyEntity(id: EntityId) {
    await this.remoteService.destroy({ entity: id });
  }

  public async listCategories(): Promise<Category[]> {
    return [new Category(CategoryType.Schema), new Category(CategoryType.Entities)];
  }

  public async getRegistrySchemas(): Promise<JSONSchema7> {
    if (!this.schema) {
      this.schema = await this.retrieveSchema();
    }
    return this.schema;
  }

  public async listTopLevelEntities(): Promise<Entity[]> {
    if (!this.entities) {
      this.entities = await this.retrieveEntities();
    }
    return this.entities.filter((entity) => !entity.parentId);
  }

  public async listComponents(entityId: EntityId): Promise<Component[]> {
    let components = this.components.get(entityId);
    if (!components) {
      components = await this.retrieveComponents(entityId);
      this.components.set(entityId, components);
    }
    return components;
  }

  public async buildComponentValueTree(component: Component): Promise<(ComponentValue | Entity)[]> {
    switch (component.name) {
      case 'bevy_transform::components::transform::Transform':
        return this.buildTransformTree(component.value);
      case 'bevy_transform::components::global_transform::GlobalTransform':
        return this.buildGlobalTransformTree(component.value);
      case this.getChildrenComponentName():
        return this.buildChildrenTree(component.value);
    }
    return this.buildGenericTree(component.value, component.errorMessage);
  }

  public async updateComponent(entityId: EntityId, typePath: TypePath, newValue: unknown) {
    const params: BevyMutateComponentParams = {
      entity: entityId,
      component: typePath,
      path: '',
      value: newValue,
    };
    await this.remoteService.mutateComponent(params);
  }

  public async invalidateCache() {
    this.entities = undefined;
    this.components.clear();
  }

  private async retrieveSchema(): Promise<JSONSchema7> {
    const schemas = await this.remoteService.registrySchema();
    const document = toJsonSchema(schemas);
    const fixedDocument = fixDocument(document);
    const dereferenced = await $RefParser.dereference(fixedDocument);
    return dereferenced as JSONSchema7;
  }

  private async retrieveEntities(): Promise<Entity[]> {
    const params = {
      data: {
        option: [this.getNameComponentName(), this.getParentComponentName()],
      },
    };
    const result = await this.remoteService.query(params);
    return Promise.all(result.map((element) => this.toEntity(element)));
  }

  private async retrieveComponents(entityId: EntityId): Promise<Component[]> {
    const listParams = {
      entity: entityId,
    };
    const componentNames = await this.remoteService.list(listParams);
    const getParams = {
      entity: entityId,
      components: componentNames,
    };
    const result = (await this.remoteService.get(getParams)) as BevyGetLenientResult;
    return Object.entries(result.components)
      .map(([key, value]) => new Component(key, value))
      .concat(Object.entries(result.errors).map(([key, value]) => new Component(key, undefined, value.message)))
      .sort((a, b) => {
        // Sort so that children are on top, then component name in lexicographical order, and errors last.
        const childrenComponentName = this.getChildrenComponentName();
        const aIsChildren = a.name === childrenComponentName;
        const bIsChildren = b.name === childrenComponentName;
        if (aIsChildren) {
          return -1;
        } else if (bIsChildren) {
          return 1;
        } else {
          const aHasErrors = a.errorMessage !== undefined;
          const bHasErrors = b.errorMessage !== undefined;
          if (aHasErrors && !bHasErrors) {
            return 1;
          }
          if (bHasErrors && !aHasErrors) {
            return -1;
          }
          return a.name.localeCompare(b.name);
        }
      });
  }

  private getNameComponentName(): TypePath {
    const NAME_COMPONENT_0_15 = 'bevy_core::name::Name';
    const NAME_COMPONENT_0_16 = 'bevy_ecs::name::Name';
    return this.bevyVersion === '0.15' ? NAME_COMPONENT_0_15 : NAME_COMPONENT_0_16;
  }

  private getChildrenComponentName(): TypePath {
    const CHILDREN_COMPONENT_0_15 = 'bevy_hierarchy::components::children::Children';
    const CHILDREN_COMPONENT_0_16 = 'bevy_ecs::hierarchy::Children';
    return this.bevyVersion === '0.15' ? CHILDREN_COMPONENT_0_15 : CHILDREN_COMPONENT_0_16;
  }

  private getParentComponentName(): TypePath {
    const PARENT_COMPONENT_0_15 = 'bevy_hierarchy::components::parent::Parent';
    const PARENT_COMPONENT_0_16 = 'bevy_ecs::hierarchy::ChildOf';
    return this.bevyVersion === '0.15' ? PARENT_COMPONENT_0_15 : PARENT_COMPONENT_0_16;
  }

  private buildGenericTree(value: any, errorMessage?: string): ComponentValue[] {
    if (Array.isArray(value)) {
      return value.map((item, index) => this.keyValueToItem(index.toString(), item));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([childKey, childValue]) => this.keyValueToItem(childKey, childValue));
    }
    const hasError = errorMessage !== undefined;
    return [new ComponentValue(null, hasError ? errorMessage : value, [], hasError)];
  }

  private keyValueToItem(key: string, value: any): ComponentValue {
    if (Array.isArray(value)) {
      const children = value.map((item, index) => this.keyValueToItem(index.toString(), item));
      return new ComponentValue(key, undefined, children);
    } else if (typeof value === 'object' && value !== null) {
      const children = Object.entries(value).map(([childKey, childValue]) => this.keyValueToItem(childKey, childValue));
      return new ComponentValue(key, undefined, children);
    } else {
      return new ComponentValue(key, value);
    }
  }

  private buildTransformTree(value: { translation: number[]; rotation: number[]; scale: number[] }): ComponentValue[] {
    return [
      new ComponentValue('translation', undefined, [
        new ComponentValue('x', value.translation[0]),
        new ComponentValue('y', value.translation[1]),
        new ComponentValue('z', value.translation[2]),
      ]),
      new ComponentValue('rotation', undefined, [
        new ComponentValue('x', value.rotation[0]),
        new ComponentValue('y', value.rotation[1]),
        new ComponentValue('z', value.rotation[2]),
        new ComponentValue('w', value.rotation[3]),
      ]),
      new ComponentValue('scale', undefined, [
        new ComponentValue('x', value.scale[0]),
        new ComponentValue('y', value.scale[1]),
        new ComponentValue('z', value.scale[2]),
      ]),
    ];
  }

  private buildGlobalTransformTree(value: number[]): ComponentValue[] {
    return [
      new ComponentValue('matrix', undefined, [
        new ComponentValue('[0..2]', [value[0], value[1], value[2]]),
        new ComponentValue('[3..5]', [value[3], value[4], value[5]]),
        new ComponentValue('[6..8]', [value[6], value[7], value[8]]),
      ]),
      new ComponentValue('translation', undefined, [
        new ComponentValue('x', value[9]),
        new ComponentValue('y', value[10]),
        new ComponentValue('z', value[11]),
      ]),
    ];
  }

  private async buildChildrenTree(value: EntityId[]): Promise<Entity[]> {
    if (!this.entities) {
      this.entities = await this.retrieveEntities();
    }
    return value.map((id) => this.entities!.filter((entity) => entity.id === id)[0]);
  }

  private async toEntity(element: { entity: EntityId; components: Record<TypePath, any> }): Promise<Entity> {
    const nameComponent = this.getNameComponentName();
    let name = element.components[nameComponent]?.name || element.components[nameComponent];
    if (!name || !(typeof name === 'string')) {
      const components = await this.listComponents(element.entity);
      name = inferEntityName(components.map((component) => component.name));
    }

    return new Entity(element.entity, name, element.components[this.getParentComponentName()]);
  }
}

function inferEntityName(components: string[]): string | null {
  // https://github.com/jakobhellermann/bevy-inspector-egui/blob/b203ca5c3f688dddbe7245f87bfcd74acd4f5da3/crates/bevy-inspector-egui/src/utils.rs#L57
  const COMPONENT_NAME_MAPPING: Record<TypePath, string> = {
    'bevy_window::window::PrimaryWindow': 'Primary Window',
    'bevy_core_pipeline::core_3d::camera_3d::Camera3d': 'Camera3d',
    'bevy_core_pipeline::core_2d::camera_2d::Camera2d': 'Camera2d',
    'bevy_pbr::light::point_light::PointLight': 'PointLight',
    'bevy_pbr::light::directional_light::DirectionalLight': 'DirectionalLight',
    'bevy_text::text::Text': 'Text',
    'bevy_ui::ui_node::Node': 'Node',
    'bevy_pbr::mesh_material::MeshMaterial3d<bevy_pbr::pbr_material::StandardMaterial>': 'PBR Mesh',
    'bevy_window::window::Window': 'Window',
    'bevy_ecs::observer::runner::ObserverState': 'Observer',
    'bevy_window::monitor::Monitor': 'Monitor',
    'bevy_picking::pointer::PointerId': 'Pointer',
    'bevy_input::gamepad::Gamepad': 'Gamepad',
    'bevy_ecs::system::system_registry::SystemIdMarker': 'System',
  };
  return components
    .filter((component) => Object.prototype.hasOwnProperty.call(COMPONENT_NAME_MAPPING, component))
    .map((component) => COMPONENT_NAME_MAPPING[component])[0];
}

function toJsonSchema(registry: BevyRegistrySchemaResult): JSONSchema7 {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $defs: Object.fromEntries(
      Object.entries(registry).map(([key, value]) => {
        const definition = toDefinition(value);
        // @ts-expect-error shortPath is a Bevy extension to JSON schema.
        definition.shortPath = value.shortPath;
        // @ts-expect-error typePath is a Bevy extension to JSON schema.
        definition.typePath = value.typePath;
        return [key, definition];
      }),
    ),
  };
}

function toDefinition(schema: BrpSchema): JSONSchema7 {
  switch (schema.kind) {
    case 'Value': {
      switch (schema.type) {
        case 'boolean':
          return {
            type: 'boolean',
            default: false,
          };
        case 'float':
          return {
            type: 'number',
            default: 0,
          };
        case 'int':
          return {
            type: 'number',
            default: 0,
            multipleOf: 1,
          };
        case 'uint':
          return {
            type: 'number',
            default: 0,
            multipleOf: 1,
            minimum: 0,
          };
        case 'string':
          return {
            type: 'string',
          };
        case 'object':
          return {
            type: 'object',
          };
      }
    }
    // Falls through.
    case 'List':
    case 'Array':
      return {
        type: 'array',
        items: (schema.items as Reference)?.type,
      };
    case 'Struct': {
      const properties = Object.fromEntries(
        Object.entries(schema.properties || {}).map(([key, value]) => [key, value.type]),
      );
      return {
        type: 'object',
        required: schema.required || [],
        properties,
      };
    }
    case 'Tuple': {
      const items = (schema.prefixItems || []).map((ref) => ref.type);
      return {
        type: 'array',
        items,
      };
    }
    case 'TupleStruct':
      return {
        $ref: (schema.prefixItems || [])[0]?.type.$ref,
      };
    case 'Set': {
      return {
        type: 'array',
        items: (schema.items as Reference)?.type,
      };
    }
    case 'Map':
      return {
        type: 'object',
        additionalProperties: schema.valueType?.type,
      };
    case 'Enum': {
      const oneOf: JSONSchema7[] = (schema.oneOf || []).map((value: string | BrpSchema) => {
        if (typeof value === 'string') {
          return {
            type: 'string',
            const: value,
            title: value,
          };
        } else if (!value.kind) {
          return {
            type: 'string',
            const: value.shortPath,
            title: value.shortPath,
          };
        } else if (value.kind === 'Tuple') {
          const properties: Record<string, JSONSchema7> = {};
          properties[value.shortPath] = (value.prefixItems || []).map((ref) => ref.type)[0];
          return {
            type: 'object',
            required: [value.shortPath],
            properties,
            title: value.shortPath,
          };
        } else {
          // if (value.kind === 'Struct')
          const properties = Object.fromEntries(
            Object.entries(schema.properties || {}).map(([key, value]) => [key, value.type]),
          );
          return {
            type: 'object',
            required: schema.required || [],
            properties,
            title: schema.shortPath,
          };
        }
      });
      const enumSchema: JSONSchema7 = {
        oneOf,
      };
      // const types = [
      //   ...new Set(
      //     oneOf
      //       .map((element) => element.type as JSONSchema7TypeName)
      //       .filter((type) => type !== undefined && typeof type !== 'boolean'),
      //   ),
      // ];
      // switch (types.length) {
      //   case 0:
      //     break;
      //   case 1:
      //     enumSchema.type = types[0];
      //     break;
      //   default:
      //     enumSchema.type = types;
      // }
      return enumSchema;
    }
  }
}

function fixDocument(document: JSONSchema7): JSONSchema7 {
  // Let TypeScript stop complaining about possibly undefined $defs.
  if (!document.$defs) {
    document.$defs = {};
  }
  // Add missing TypeId type.
  if (!document.$defs['core::any::TypeId']) {
    document.$defs['core::any::TypeId'] = {
      $ref: '#/$defs/u128',
    };
  }
  // Fix some definitions.
  document.$defs = Object.fromEntries(Object.entries(document.$defs).map(fixDefinition));
  return document;
}

function fixDefinition([name, definition]: [string, JSONSchema7Definition]): [string, JSONSchema7Definition] {
  if (typeof definition === 'boolean') {
    return [name, definition];
  }
  // Replace Option::None values from 'None' to null.
  if (name.startsWith('core::option::Option')) {
    definition.oneOf = definition.oneOf?.map((oneOfDef) => {
      if (typeof oneOfDef === 'boolean') {
        return oneOfDef;
      }
      if (oneOfDef.const === 'None') {
        return {
          type: 'null',
          const: null,
          title: 'None',
        };
      } else {
        return {
          // @ts-expect-error properties cannot be undefined.
          $ref: oneOfDef.properties.Some.$ref,
          // @ts-expect-error shortPath is a Bevy extension to JSON schema.
          title: `Some${definition.shortPath ? `<${definition.shortPath}>` : ''}`,
        };
      }
    });
    // def.type = [...new Set(def.oneOf?.map((element) => (element as JSONSchema7).type as JSONSchema7TypeName))];
    return [name, definition];
  } else {
    switch (name) {
      case 'bevy_ecs::name::Name':
      case 'alloc::borrow::Cow<str>':
      case 'smol_str::SmolStr':
      case 'uuid::Uuid':
      case 'std::path::PathBuf':
      case 'bevy_asset::path::AssetPath':
      case 'bevy_asset::render_asset::RenderAssetUsages':
        return [name, { type: 'string' }];
      case 'bevy_ecs::entity::Entity':
        return [name, { $ref: '#/$defs/u64' }];
      case 'core::num::NonZeroI16':
        return [name, { $ref: '#/$defs/i16' }];
      case 'core::num::NonZeroU16':
        return [name, { $ref: '#/$defs/u16' }];
      case 'core::num::NonZeroU32':
        return [name, { $ref: '#/$defs/u32' }];
      case 'core::ops::Range<f32>':
        return [
          name,
          {
            type: 'object',
            properties: {
              start: { $ref: '#/$defs/f32' },
              end: { $ref: '#/$defs/f32' },
            },
            required: ['start', 'end'],
          },
        ];
      case 'core::ops::Range<u32>':
        return [
          name,
          {
            type: 'object',
            properties: {
              start: { $ref: '#/$defs/u32' },
              end: { $ref: '#/$defs/u32' },
            },
            required: ['start', 'end'],
          },
        ];
      case 'core::time::Duration':
        return [
          name,
          {
            type: 'object',
            properties: {
              nanos: { $ref: '#/$defs/u32' },
              secs: { $ref: '#/$defs/u32' },
            },
            required: ['nanos', 'secs'],
          },
        ];
    }
  }
  return [name, definition];
}
