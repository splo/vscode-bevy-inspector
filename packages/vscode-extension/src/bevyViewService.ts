import $RefParser, { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { BevyGetLenientResult, BevyRemoteService, Schema as BrpSchema, EntityId, TypePath } from './brp';

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
    private schema?: JSONSchema;
    private entities?: Entity[];
    private components: Map<EntityId, Component[]> = new Map();

    constructor(remoteService: BevyRemoteService) {
        this.remoteService = remoteService;
    }

    public async destroyEntity(id: EntityId) {
        await this.remoteService.destroy({ entity: id });
    }

    public async listCategories(): Promise<Category[]> {
        return [new Category(CategoryType.Schema), new Category(CategoryType.Entities)];
    }

    public async getRegistrySchemas(): Promise<Schema[]> {
        if (!this.schema) {
            this.schema = await this.retrieveSchema();
        }
        // @ts-ignore
        return Object.values(this.schema.$defs).map((schema) => this.toSchema(schema));
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

    public async invalidateCache() {
        this.entities = undefined;
        this.components.clear();
    }

    private async retrieveSchema(): Promise<JSONSchema> {
        const schemas = await this.remoteService.registrySchema();
        const document: JSONSchema = { $defs: schemas };
        if (!document.$defs['core::any::TypeId']) {
            console.warn('core::any::TypeId not found in registry schemas, adding it manually');
            document.$defs['core::any::TypeId'] = {
                items: false,
                kind: 'Tuple',
                prefixItems: [
                    {
                        type: {
                            $ref: '#/$defs/u64',
                        },
                    },
                    {
                        type: {
                            $ref: '#/$defs/u64',
                        },
                    },
                ],
                shortPath: 'TypeId',
                type: 'array',
                typePath: 'core::any::TypeId',
            };
        }
        return await $RefParser.dereference(document, { mutateInputSchema: false });
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
                    let aHasErrors = a.errorMessage !== undefined;
                    let bHasErrors = b.errorMessage !== undefined;
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
        let hasError = errorMessage !== undefined;
        return [new ComponentValue(null, hasError ? errorMessage : value, [], hasError)];
    }

    private keyValueToItem(key: string, value: any): ComponentValue {
        if (Array.isArray(value)) {
            const children = value.map((item, index) => this.keyValueToItem(index.toString(), item));
            return new ComponentValue(key, undefined, children);
        } else if (typeof value === 'object' && value !== null) {
            const children = Object.entries(value).map(([childKey, childValue]) =>
                this.keyValueToItem(childKey, childValue),
            );
            return new ComponentValue(key, undefined, children);
        } else {
            return new ComponentValue(key, value);
        }
    }

    private buildTransformTree(value: {
        translation: number[];
        rotation: number[];
        scale: number[];
    }): ComponentValue[] {
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
            let components = await this.listComponents(element.entity);
            name = inferEntityName(components.map((component) => component.name));
        }

        return new Entity(element.entity, name, element.components[this.getParentComponentName()]);
    }

    private toSchema(schema: BrpSchema): Schema {
        return new Schema(schema.shortPath, schema.typePath, schema.kind);
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
        .filter((component) => COMPONENT_NAME_MAPPING.hasOwnProperty(component))
        .map((component) => COMPONENT_NAME_MAPPING[component])[0];
}
