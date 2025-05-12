import * as vscode from 'vscode';
import type { EntityId, TypePath } from '../../inspector-data/types';
import type { EntityNode } from './entityTree';

class EntityItem extends vscode.TreeItem {
  constructor(entity: EntityNode) {
    const label = String(entity.id);
    const collapsibleState =
      entity.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
    super(label, collapsibleState);
    this.id = String(entity.id);
    this.description = entity.name || findNameFromComponents(entity.componentNames);
    this.iconPath = new vscode.ThemeIcon(
      findIconFromComponents(entity.componentNames) || 'symbol-class',
      new vscode.ThemeColor('symbolIcon.classForeground'),
    );
    this.contextValue = 'entity';
  }
}

type TreeDataChange = EntityNode | undefined | null | void;

export class EntityTreeDataProvider implements vscode.TreeDataProvider<EntityNode> {
  private readonly treeDataChangeEmitter = new vscode.EventEmitter<TreeDataChange>();
  public readonly onDidChangeTreeData = this.treeDataChangeEmitter.event;

  private entities: EntityNode[] | undefined;

  public setEntities(entities: EntityNode[]) {
    this.entities = entities.sort((a, b) => a.id - b.id);
    this.treeDataChangeEmitter.fire();
  }

  public setEntityName(entityId: EntityId, newName: string) {
    this.entities = this.entities?.map((entity) => {
      if (entity.id === entityId) {
        return {
          ...entity,
          name: newName,
        };
      }
      return entity;
    });
    this.treeDataChangeEmitter.fire();
  }

  getTreeItem(element: EntityNode): vscode.TreeItem {
    return new EntityItem(element);
  }

  getChildren(element?: EntityNode | undefined): vscode.ProviderResult<EntityNode[]> {
    if (element === undefined) {
      return this.entities;
    } else {
      return element.children;
    }
  }

  getParent(element: EntityNode): vscode.ProviderResult<EntityNode> {
    return (this.entities || [])
      .map((root) => this.findParentRecursive(root, element.id))
      .find((parent) => parent !== undefined);
  }

  private findParentRecursive(node: EntityNode, childId: EntityId): EntityNode | undefined {
    return node.children.find((child) => {
      if (child.id === childId) {
        return true;
      }
      const found = this.findParentRecursive(child, childId);
      return !!found;
    })
      ? node
      : node.children.map((child) => this.findParentRecursive(child, childId)).find((found) => found !== undefined);
  }
}

function findNameFromComponents(typePaths: TypePath[]): string | undefined {
  return typePaths.map((name) => COMPONENT_TYPE_MAPPING[name]).find((name) => name !== undefined);
}

function findIconFromComponents(typePaths: TypePath[]): string | undefined {
  return Object.keys(ICON_MAPPING)
    .flatMap((pattern) => typePaths.map((path) => ({ pattern, path })))
    .filter(({ pattern, path }) => path.toLowerCase().includes(pattern.toLowerCase()))
    .map(({ pattern }) => ICON_MAPPING[pattern])
    .find((icon) => icon !== undefined);
}

const COMPONENT_TYPE_MAPPING: Record<TypePath, string> = {
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

const ICON_MAPPING: Record<string, string> = {
  '::camera': 'device-camera-video',
  'bevy_pbr::light::': 'lightbulb-empty',
  'bevy_window::': 'window',
  'bevy_ui::': 'symbol-color',
  'bevy_transform::components::': 'symbol-method',
  'bevy_ecs::observer::': 'telescope',
  'bevy_ecs::system::': 'gear',
  'bevy_audio::': 'music',
  'bevy_input::': 'game',
  'bevy_time::': 'watch',
  'bevy_render::': 'layers',
};
