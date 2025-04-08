import * as vscode from 'vscode';
import type { EntityId, EntityRef, TypePath } from '@bevy-inspector/inspector-data/types';
import type { InspectorRepository } from '../../inspectorRepository';
import { TypeSchemaService } from '../../brp/typeSchemaService';

export type TreeItemType = 'Category' | 'Resource' | 'Entity';

export class TreeItem extends vscode.TreeItem {
  public readonly type: TreeItemType;
  public readonly contextValue: Lowercase<TreeItemType>;

  constructor(type: TreeItemType, label: string, collapsibleState: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);
    this.type = type;
    this.contextValue = type.toLowerCase() as Lowercase<TreeItemType>;
  }
}

export type CategoryType = 'Resources' | 'Entities';

export class CategoryItem extends TreeItem {
  constructor(type: CategoryType, expanded = true) {
    const collapsibleState = expanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;
    super('Category', type, collapsibleState);
    this.id = `Category-${type}`;
    this.iconPath = new vscode.ThemeIcon('type-hierarchy', new vscode.ThemeColor('symbolIcon.constantForeground'));
  }
}

export class ResourceItem extends TreeItem {
  typePath: TypePath;

  constructor(typePath: TypePath) {
    super('Resource', TypeSchemaService.shortenName(typePath), vscode.TreeItemCollapsibleState.None);
    this.id = `Resource-${typePath}`;
    this.typePath = typePath;
    this.tooltip = `Type: ${typePath}`;
    this.iconPath = new vscode.ThemeIcon(
      getTypeIcon([typePath]) || 'symbol-misc',
      new vscode.ThemeColor('symbolIcon.interfaceForeground'),
    );
  }
}

export class EntityItem extends TreeItem {
  entityId: EntityId;
  children: EntityItem[];

  constructor(entity: EntityRef, children: EntityItem[] = []) {
    const label = entity.name || String(entity.id);
    const collapsibleState =
      children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
    super('Entity', label, collapsibleState);
    this.id = `Entity-${entity.id}`;
    this.entityId = entity.id;
    this.children = children;
    this.tooltip = `Entity ID: ${entity.id}`;
    this.iconPath = new vscode.ThemeIcon(
      getTypeIcon(entity.componentNames) || 'symbol-class',
      new vscode.ThemeColor('symbolIcon.classForeground'),
    );
  }
}

type TreeDataChange = TreeItem | undefined | null | void;

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private readonly treeDataChangeEmitter: vscode.EventEmitter<TreeDataChange> =
    new vscode.EventEmitter<TreeDataChange>();
  public readonly onDidChangeTreeData: vscode.Event<TreeDataChange> = this.treeDataChangeEmitter.event;

  repository: InspectorRepository;
  resourcesCategory: TreeItem = new CategoryItem('Resources', false);
  entitiesCategory: TreeItem = new CategoryItem('Entities');

  constructor(repository: InspectorRepository) {
    this.repository = repository;
  }

  public refresh(element?: TreeItem): void {
    console.debug(`Refreshing "${element?.label || 'root'}" tree item`);
    this.treeDataChangeEmitter.fire(element);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
    switch (element?.type) {
      case undefined: // Root.
        return [this.resourcesCategory, this.entitiesCategory];
      case 'Category': {
        switch (element) {
          case this.resourcesCategory:
            return this.listResources();
          case this.entitiesCategory:
            return this.listEntities();
        }
        break;
      }
      case 'Resource':
        return [];
      case 'Entity': {
        return (element as EntityItem).children;
      }
    }
    return [];
  }

  getParent(element: TreeItem): vscode.ProviderResult<TreeItem> {
    switch (element.type) {
      case 'Resource':
        return this.resourcesCategory;
      case 'Entity':
        return this.entitiesCategory;
      default:
        return null;
    }
  }

  resolveTreeItem(_item: vscode.TreeItem, element: TreeItem): vscode.ProviderResult<vscode.TreeItem> {
    return element;
  }

  private async listResources(): Promise<TreeItem[]> {
    const resourceNames = await this.repository.listResourceNames();
    return resourceNames.map((typePath) => new ResourceItem(typePath));
  }

  private async listEntities(): Promise<TreeItem[]> {
    const entityRefs = await this.repository.listEntityRefs();

    // Group entities by parent.
    const entitiesMap = new Map<EntityId | null, EntityRef[]>();

    for (const entity of entityRefs) {
      if (!entitiesMap.has(entity.parentId ?? null)) {
        entitiesMap.set(entity.parentId ?? null, []);
      }
      entitiesMap.get(entity.parentId ?? null)!.push(entity);
    }

    // Build entity tree recursively.
    const buildEntityTree = (parentId: EntityId | null): EntityItem[] => {
      const children = entitiesMap.get(parentId) || [];
      return children.map((entity) => {
        const childEntities = buildEntityTree(entity.id);
        return new EntityItem(entity, childEntities);
      });
    };

    // Return top-level entities (those with null parent).
    const topLevelEntities = buildEntityTree(null);
    return topLevelEntities;
  }
}

function getTypeIcon(typePaths: TypePath[]): string | undefined {
  return Object.keys(ICON_MAPPING)
    .flatMap((pattern) => typePaths.map((path) => ({ pattern, path })))
    .filter(({ pattern, path }) => path.toLowerCase().includes(pattern.toLowerCase()))
    .map(({ pattern }) => ICON_MAPPING[pattern])
    .find((icon) => icon !== undefined);
}

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
