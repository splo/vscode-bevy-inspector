import { BevyGetLenientResult, BevyRemoteService, ComponentName, EntityId } from "./brp";

// Resources, assets, etc. are not yet supported by the official BRP plugin.
export enum CategoryType {
    Entities,
}

export class Category {
    type: CategoryType;

    constructor(type: CategoryType) {
        this.type = type;
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
    name: ComponentName;
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

const NAME_COMPONENT = "bevy_core::name::Name";
const PARENT_COMPONENT = "bevy_hierarchy::components::parent::Parent";

export class BevyTreeService {
    private remoteService: BevyRemoteService;

    constructor(remoteService: BevyRemoteService) {
        this.remoteService = remoteService;
    }

    public async destroyEntity(id: EntityId) {
        await this.remoteService.destroy({ entity: id });
    }

    public async listCategories(): Promise<Category[]> {
        return [new Category(CategoryType.Entities)];
    }

    public async listTopLevelEntities(): Promise<Entity[]> {
        const params = {
            data: {
                option: [NAME_COMPONENT, PARENT_COMPONENT]
            }
        };
        const result = await this.remoteService.query(params);
        return Promise.all(result
            .filter(element => !element.components[PARENT_COMPONENT])
            .map(element => this.toEntity(element)));
    }

    public async listComponents(entityId: EntityId): Promise<Component[]> {
        const listParams = {
            entity: entityId
        };
        const componentNames = await this.remoteService.list(listParams);
        const getParams = {
            entity: entityId,
            components: componentNames
        };
        const result = await this.remoteService.get(getParams) as BevyGetLenientResult;
        return Object.entries(result.components).map(
            ([key, value]) => new Component(key, value)
        ).concat(Object.entries(result.errors).map(
            ([key, value]) => new Component(key, undefined, value.message)
        )).sort((a, b) => {
            // Sort so that children are on top, then component name in lexicographical order, and errors last.
            const aIsChildren = a.name === 'bevy_hierarchy::components::children::Children';
            const bIsChildren = b.name === 'bevy_hierarchy::components::children::Children';
            if (aIsChildren) { return -1; }
            else if (bIsChildren) { return 1; }
            else {
                let aHasErrors = a.errorMessage !== undefined;
                let bHasErrors = b.errorMessage !== undefined;
                if (aHasErrors && !bHasErrors) { return 1; }
                if (bHasErrors && !aHasErrors) { return -1; }
                return a.name.localeCompare(b.name);
            }
        });
    }

    public async buildComponentValueTree(component: Component): Promise<(ComponentValue | Entity)[]> {
        switch (component.name) {
            case 'bevy_transform::components::transform::Transform':
                return this.buildTransformTree(component.value);
            case 'bevy_transform::components::global_transform::GlobalTransform':
                return this.buildGlobalTransformTree(component.value);
            case 'bevy_hierarchy::components::children::Children':
                return this.buildChildrenTree(component.value);
        }
        return this.buildGenericTree(component.value, component.errorMessage);
    }

    private buildGenericTree(value: any, errorMessage?: string): ComponentValue[] {
        if (Array.isArray(value)) {
            return value.map((item, index) => this.keyValueToItem(index.toString(), item));
        }
        if (typeof value === "object" && value !== null) {
            return Object.entries(value).map(([childKey, childValue]) => this.keyValueToItem(childKey, childValue));
        }
        let hasError = errorMessage !== undefined;
        return [new ComponentValue(null, hasError ? errorMessage : value, [], hasError)];
    }

    private keyValueToItem(key: string, value: any): ComponentValue {
        if (Array.isArray(value)) {
            const children = value.map((item, index) => this.keyValueToItem(index.toString(), item));
            return new ComponentValue(key, undefined, children);
        } else if (typeof value === "object" && value !== null) {
            const children = Object.entries(value).map(([childKey, childValue]) => this.keyValueToItem(childKey, childValue));
            return new ComponentValue(key, undefined, children);
        } else {
            return new ComponentValue(key, value);
        }
    };

    private buildTransformTree(value: { translation: number[], rotation: number[], scale: number[] }): ComponentValue[] {
        return [
            new ComponentValue("translation", undefined, [
                new ComponentValue("x", value.translation[0]),
                new ComponentValue("y", value.translation[1]),
                new ComponentValue("z", value.translation[2]),
            ]),
            new ComponentValue("rotation", undefined, [
                new ComponentValue("x", value.rotation[0]),
                new ComponentValue("y", value.rotation[1]),
                new ComponentValue("z", value.rotation[2]),
                new ComponentValue("w", value.rotation[3]),
            ]),
            new ComponentValue("scale", undefined, [
                new ComponentValue("x", value.scale[0]),
                new ComponentValue("y", value.scale[1]),
                new ComponentValue("z", value.scale[2]),
            ]),
        ];
    }

    private buildGlobalTransformTree(value: number[]): ComponentValue[] {
        return [
            new ComponentValue("matrix", undefined, [
                new ComponentValue("[0..2]", [value[0], value[1], value[2]]),
                new ComponentValue("[3..5]", [value[3], value[4], value[5]]),
                new ComponentValue("[6..8]", [value[6], value[7], value[8]]),
            ]),
            new ComponentValue("translation", undefined, [
                new ComponentValue("x", value[9]),
                new ComponentValue("y", value[10]),
                new ComponentValue("z", value[11]),
            ]),
        ];
    }

    private async buildChildrenTree(value: EntityId[]): Promise<Entity[]> {
        const params = {
            data: {
                option: [NAME_COMPONENT, PARENT_COMPONENT]
            }
        };
        const result = await this.remoteService.query(params);
        const allEntities = await Promise.all(result.map(entity => this.toEntity(entity)));
        return value.map(id => allEntities.filter(entity => entity.id === id)[0]);
    }


    private async toEntity(element: { entity: EntityId; components: Record<ComponentName, any>; }): Promise<Entity> {
        let name = element.components[NAME_COMPONENT]?.name || element.components[NAME_COMPONENT];
        if (!name || !(typeof name === "string")) {
            let components = await this.remoteService.list({ entity: element.entity });
            name = inferEntityName(components);
        }

        return new Entity(element.entity, name, element.components[PARENT_COMPONENT]);
    }
}
function inferEntityName(components: string[]): string | null {
    // https://github.com/jakobhellermann/bevy-inspector-egui/blob/b203ca5c3f688dddbe7245f87bfcd74acd4f5da3/crates/bevy-inspector-egui/src/utils.rs#L57
    const COMPONENT_NAME_MAPPING: Record<ComponentName, string> = {
        "bevy_window::window::PrimaryWindow": "Primary Window",
        "bevy_core_pipeline::core_3d::camera_3d::Camera3d": "Camera3d",
        "bevy_core_pipeline::core_2d::camera_2d::Camera2d": "Camera2d",
        "bevy_pbr::light::point_light::PointLight": "PointLight",
        "bevy_pbr::light::directional_light::DirectionalLight": "DirectionalLight",
        "bevy_text::text::Text": "Text",
        "bevy_ui::ui_node::Node": "Node",
        "bevy_pbr::mesh_material::MeshMaterial3d<bevy_pbr::pbr_material::StandardMaterial>": "PBR Mesh",
        "bevy_window::window::Window": "Window",
        "bevy_ecs::observer::runner::ObserverState": "Observer",
        "bevy_window::monitor::Monitor": "Monitor",
        "bevy_picking::pointer::PointerId": "Pointer",
        "bevy_input::gamepad::Gamepad": "Gamepad",
        "bevy_ecs::system::system_registry::SystemIdMarker": "System",
    };
    return components
        .filter(component => COMPONENT_NAME_MAPPING.hasOwnProperty(component))
        .map(component => COMPONENT_NAME_MAPPING[component])[0];
}
