import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { BevyTreeService, Category, CategoryType, Component, ComponentValue, Entity } from './bevyViewService';

export type BevyTreeData = Category | Entity | Component | ComponentValue | ErrorItem;

class ErrorItem {
    code?: string;
    message?: string;
}

export class BevyTreeDataProvider implements TreeDataProvider<BevyTreeData> {

    private _onDidChangeTreeData: EventEmitter<BevyTreeData | undefined | null | void> = new EventEmitter<BevyTreeData | undefined | null | void>();
    readonly onDidChangeTreeData: Event<BevyTreeData | undefined | null | void> = this._onDidChangeTreeData.event;

    private service: BevyTreeService;

    constructor(service: BevyTreeService) {
        this.service = service;
    }

    refresh(): void {
        console.debug('Refreshing...');
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
                return await this.service.listTopLevelEntities();
            } else if (element instanceof Entity) {
                return await this.service.listComponents(element.id);
            } else if (element instanceof Component) {
                return await this.service.buildComponentValueTree(element);
            } else if (element instanceof ComponentValue) {
                return element.children;
            }
        } catch (error: any) {
            console.warn('Error while contacting server', error);
            const item = new ErrorItem();
            item.code = error.code;
            item.message = error.message;
            return [item];
        }
        return [];
    }

    getTreeItem(element: BevyTreeData | BevyTreeData[]): TreeItem {
        if (element instanceof Category) {
            return this.buildCategoryTreeItem(element);
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
        const treeItem = new TreeItem(CategoryType[category.type], TreeItemCollapsibleState.Expanded);
        treeItem.iconPath = new ThemeIcon('type-hierarchy');
        treeItem.contextValue = 'category';
        return treeItem;
    }

    private buildEntityTreeItem(entity: Entity): TreeItem {
        const treeItem = new TreeItem(entity.name || entity.id.toString(), TreeItemCollapsibleState.Collapsed);
        if (entity.name !== undefined) {
            treeItem.description = entity.id.toString();
        }
        treeItem.iconPath = new ThemeIcon('symbol-class');
        treeItem.contextValue = 'entity';
        return treeItem;
    }

    private buildComponentNameTreeItem(component: Component): TreeItem {
        let { name, errorMessage } = component;
        const treeItem = new TreeItem(shortenName(name), TreeItemCollapsibleState.Collapsed);
        treeItem.description = name;
        treeItem.iconPath = new ThemeIcon(errorMessage === undefined ? 'checklist' : 'error');
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
                case 'string': treeItem.iconPath = new ThemeIcon('symbol-string'); break;
                case 'boolean': treeItem.iconPath = new ThemeIcon('symbol-boolean'); break;
                case 'number': treeItem.iconPath = new ThemeIcon('symbol-number'); break;
                case 'object': treeItem.iconPath = new ThemeIcon('symbol-object'); break;
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

function shortenName(name: string): string {
    return name.split("::").at(-1) ?? name;
}
