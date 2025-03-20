import type { Event, TreeDataProvider } from 'vscode';
import { EventEmitter, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import type { BevyTreeService } from './bevyViewService';
import { Category, CategoryType, Component, ComponentValue, Entity } from './bevyViewService';

class Schema {
  name: string;
  typePath: string;
  constructor(name: string, typePath: string) {
    this.name = name;
    this.typePath = typePath;
  }
}

export type BevyTreeData = Category | Schema | Entity | Component | ComponentValue | ErrorItem;

class ErrorItem {
  code?: string;
  message?: string;
}

export class BevyTreeDataProvider implements TreeDataProvider<BevyTreeData> {
  private _onDidChangeTreeData: EventEmitter<BevyTreeData | undefined | null | void> = new EventEmitter<
    BevyTreeData | undefined | null | void
  >();
  readonly onDidChangeTreeData: Event<BevyTreeData | undefined | null | void> = this._onDidChangeTreeData.event;

  private service: BevyTreeService;

  constructor(service: BevyTreeService) {
    this.service = service;
  }

  refresh(): void {
    console.debug('Refreshing...');
    this.service.invalidateCache();
    this._onDidChangeTreeData.fire();
  }

  async destroyEntity(entity: Entity) {
    await this.service.destroyEntity(entity.id);
  }

  async getChildren(element?: BevyTreeData): Promise<BevyTreeData[]> {
    try {
      if (!element) {
        return await this.service.listCategories();
      } else if (element instanceof Category) {
        switch (element.type) {
          case CategoryType.Schema: {
            const jsonSchema = await this.service.getRegistrySchemas();
            const schemas: Schema[] = Object.keys(jsonSchema.$defs || {}).map(
              (typePath) => new Schema(shortenName(typePath), typePath),
            );
            return schemas;
          }
          case CategoryType.Entities:
            return await this.service.listTopLevelEntities();
        }
      } else if (element instanceof Entity) {
        return await this.service.listComponents(element.id);
      } else if (element instanceof Component) {
        if (!isPrimitiveComponent(element)) {
          return await this.service.buildComponentValueTree(element);
        }
      } else if (element instanceof ComponentValue) {
        return element.children;
      }
    } catch (error: unknown) {
      console.warn('Error while contacting server', error);
      const item = new ErrorItem();
      if (typeof error === 'object' && error !== null) {
        if ('code' in error && typeof error.code === 'string') {
          item.code = error.code;
        }
        if ('message' in error && typeof error.message === 'string') {
          item.message = error.message;
        }
      }
      return [item];
    }
    return [];
  }

  getTreeItem(element: BevyTreeData | BevyTreeData[]): TreeItem {
    if (element instanceof Category) {
      return this.buildCategoryTreeItem(element);
    } else if (element instanceof Schema) {
      return this.buildSchemaTreeItem(element);
    } else if (element instanceof Entity) {
      return this.buildEntityTreeItem(element);
    } else if (element instanceof Component) {
      return this.buildComponentNameTreeItem(element);
    } else if (element instanceof ComponentValue) {
      return this.buildComponentValueTreeItem(element);
    } else if (element instanceof ErrorItem) {
      return this.buildErrorTreeItem(element);
    }
    const errorItem = new ErrorItem();
    errorItem.message = `Unknown tree element type ${element}`;
    throw this.buildErrorTreeItem(errorItem);
  }

  private buildCategoryTreeItem(category: Category): TreeItem {
    const collapsableState =
      category.type === CategoryType.Entities ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed;
    const treeItem = new TreeItem(CategoryType[category.type], collapsableState);
    treeItem.iconPath = new ThemeIcon('type-hierarchy');
    treeItem.contextValue = 'category';
    return treeItem;
  }

  private buildSchemaTreeItem(schema: Schema): TreeItem {
    const treeItem = new TreeItem(schema.name, TreeItemCollapsibleState.None);
    treeItem.tooltip = schema.typePath;
    treeItem.iconPath = new ThemeIcon('symbol-type-parameter');
    treeItem.contextValue = 'schema';
    return treeItem;
  }

  private buildEntityTreeItem(entity: Entity): TreeItem {
    const treeItem = new TreeItem(entity.name || entity.id.toString(), TreeItemCollapsibleState.Collapsed);
    if (entity.name !== undefined) {
      treeItem.tooltip = entity.id.toString();
    }
    treeItem.iconPath = new ThemeIcon('symbol-class');
    treeItem.contextValue = 'entity';
    return treeItem;
  }

  private buildComponentNameTreeItem(component: Component): TreeItem {
    const { name, errorMessage } = component;
    const treeItem = new TreeItem(shortenName(name));
    treeItem.tooltip = name;

    const isPrimitive = isPrimitiveComponent(component);
    if (isPrimitive) {
      treeItem.description = JSON.stringify(component.value);
    }

    treeItem.iconPath = new ThemeIcon(errorMessage === undefined ? 'checklist' : 'error');
    treeItem.collapsibleState = isPrimitive ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed;
    treeItem.contextValue = 'component';
    return treeItem;
  }

  private buildComponentValueTreeItem(componentValue: ComponentValue): TreeItem {
    const { name, value, hasError, children } = componentValue;
    const treeItem = new TreeItem(name || '');
    treeItem.description = value === null ? 'null' : value?.toString() || '';
    treeItem.contextValue = 'value';
    treeItem.collapsibleState = children.length > 0 ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
    if (hasError) {
      treeItem.iconPath = new ThemeIcon('warning');
    } else {
      switch (typeof value) {
        case 'string':
          treeItem.iconPath = new ThemeIcon('symbol-string');
          break;
        case 'boolean':
          treeItem.iconPath = new ThemeIcon('symbol-boolean');
          break;
        case 'number':
          treeItem.iconPath = new ThemeIcon('symbol-number');
          break;
        case 'object':
          treeItem.iconPath = new ThemeIcon('symbol-object');
          break;
      }
    }

    return treeItem;
  }

  private buildErrorTreeItem(error: ErrorItem): TreeItem {
    const treeItem = new TreeItem(error.message || 'Error');
    treeItem.description = error?.code;
    return treeItem;
  }
}

// https://github.com/bevyengine/disqualified/blob/cc4940da85aa64070a34da590ff5aab12e7c951d/src/short_name.rs#L50
function shortenName(name: string): string {
  return name.replaceAll(/\w*::/g, '');
}

function isPrimitiveComponent(component: Component) {
  if (component.value instanceof Object) {
    return Object.keys(component.value).length === 0;
  }
  return true;
}
