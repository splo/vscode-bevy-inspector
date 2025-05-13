import * as vscode from 'vscode';
import type { BrpSchema, Reference, TypePath } from '../../brp/brp-0.16';

type TreeDataChange = SchemaNodeItem | undefined | null | void;

export class RegistryDataProvider implements vscode.TreeDataProvider<SchemaNodeItem> {
  private registry: BrpSchema[] | undefined;
  private readonly treeDataChangeEmitter = new vscode.EventEmitter<TreeDataChange>();
  public readonly onDidChangeTreeData = this.treeDataChangeEmitter.event;

  public setRegistry(registry: BrpSchema[]): void {
    this.registry = registry;
    this.treeDataChangeEmitter.fire();
  }

  getTreeItem(element: SchemaNodeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: SchemaNodeItem | undefined): vscode.ProviderResult<SchemaNodeItem[]> {
    if (element === undefined) {
      return toTree(this.registry ?? []);
    } else {
      return element.children;
    }
  }
}

function toTree(registry: BrpSchema[]): SchemaNodeItem[] {
  interface TreeNode {
    type?: BrpSchema;
    children?: Map<string, TreeNode>;
  }

  function insertType(tree: Map<string, TreeNode>, modulePaths: string[], schema: BrpSchema) {
    if (modulePaths.length === 0) {
      tree.set(schema.shortPath, { type: schema });
    } else {
      const [head, ...tail] = modulePaths;
      if (!tree.has(head)) {
        tree.set(head, { children: new Map<string, TreeNode>() });
      }
      insertType(tree.get(head)!.children!, tail, schema);
    }
  }

  function mapToNodes(map: Map<string, TreeNode>): SchemaNodeItem[] {
    const nodes: SchemaNodeItem[] = [];
    for (const [key, value] of map.entries()) {
      if (value.type) {
        nodes.push(toType(value.type));
      } else if (value.children) {
        nodes.push(toPath(key, mapToNodes(value.children)));
      }
    }
    return nodes.sort((a, b) => {
      return a.type.localeCompare(b.type) * 10 + (a.label?.toString() ?? '').localeCompare(b.label?.toString() ?? '');
    });
  }

  const tree = new Map<string, TreeNode>();
  registry.forEach((schema) => {
    const modulePaths = splitByPathSeparator(schema.typePath);
    return insertType(tree, modulePaths, schema);
  });

  return mapToNodes(tree);
}

/** Split typePath by '::' but ignore '::' inside parentheses and brackets */
function splitByPathSeparator(typePath: TypePath): string[] {
  let modulePaths: string[] = [];
  let current = '';
  let level = 0;
  for (let i = 0; i < typePath.length; i++) {
    const c = typePath[i];
    if (c === '(' || c === '[' || c === '<') {
      level++;
    }
    if (c === ')' || c === ']' || c === '>') {
      level--;
    }
    if (level === 0 && typePath.slice(i, i + 2) === '::') {
      modulePaths.push(current);
      current = '';
      i++; // skip next ':'
    } else {
      current += c;
    }
  }
  if (current.length > 0) {
    modulePaths.push(current);
  }
  if (modulePaths.length === 1 && modulePaths[0] === '') {
    modulePaths = [];
  }
  // The last element is the short path name.
  return modulePaths.slice(0, -1);
}

function toPath(name: string, children: SchemaNodeItem[]): SchemaNodeItem {
  return new SchemaNodeItem({
    type: 'Path',
    label: name,
    children,
  });
}

function toType(schema: BrpSchema): SchemaNodeItem {
  const children = [new SchemaNodeItem({ type: 'TypePathField', label: 'Type Path', description: schema.typePath })];
  if (schema.kind) {
    children.push(new SchemaNodeItem({ type: 'ValueField', label: 'Kind', description: schema.kind }));
  }
  if (schema.keyType) {
    children.push(
      new SchemaNodeItem({ type: 'TypePathField', label: 'Key Type', description: refToTypePath(schema.keyType) }),
    );
  }
  if (schema.valueType) {
    children.push(
      new SchemaNodeItem({ type: 'TypePathField', label: 'Value Type', description: refToTypePath(schema.valueType) }),
    );
  }
  if (schema.type) {
    children.push(new SchemaNodeItem({ type: 'ValueField', label: 'Type', description: schema.type }));
  }
  if (schema.reflectTypes) {
    children.push(
      new SchemaNodeItem({
        type: 'ReflectTypes',
        label: 'Reflect Types',
        children: schema.reflectTypes.map(
          (reflectType) => new SchemaNodeItem({ type: 'ValueField', label: reflectType }),
        ),
      }),
    );
  }
  if (schema.properties) {
    children.push(
      new SchemaNodeItem({
        type: 'Properties',
        label: 'Properties',
        children: Object.entries(schema.properties).map(
          ([key, ref]) =>
            new SchemaNodeItem({
              type: 'ValueField',
              label: `${key}${schema.required?.find((req) => req === key) ? '*' : ''}`,
              description: refToTypePath(ref),
            }),
        ),
      }),
    );
  }
  if (schema.oneOf) {
    children.push(
      new SchemaNodeItem({
        type: 'OneOf',
        label: 'One Of',
        children: schema.oneOf
          .map((element) => (typeof element === 'string' ? element : element.typePath))
          .map((label) => {
            return new SchemaNodeItem({ type: 'TypePathField', label });
          }),
      }),
    );
  }
  if (schema.prefixItems) {
    children.push(
      new SchemaNodeItem({
        type: 'Items',
        label: 'Prefix Items',
        children: schema.prefixItems.map(
          (ref) => new SchemaNodeItem({ type: 'TypePathField', label: refToTypePath(ref) }),
        ),
      }),
    );
  }
  if (schema.items) {
    children.push(new SchemaNodeItem({ type: 'Items', label: 'Items', description: refToTypePath(schema.items) }));
  }
  return new SchemaNodeItem({
    type: 'Type',
    label: schema.shortPath,
    children: children,
  });
}

function refToTypePath(ref: Reference): TypePath {
  return ref.type.$ref.substring(8); // Strip the '#/$defs/' prefix.
}

type SchemaNodeType =
  | 'Path'
  | 'Type'
  | 'Items'
  | 'Properties'
  | 'OneOf'
  | 'ReflectTypes'
  | 'TypePathField'
  | 'ValueField';

interface NodeOptions {
  type: SchemaNodeType;
  label: string;
  description?: string;
  children?: SchemaNodeItem[];
}

class SchemaNodeItem extends vscode.TreeItem {
  type: SchemaNodeType;
  children: SchemaNodeItem[];

  constructor(options: NodeOptions) {
    const collapsibleState = getCollapsibleState(options);
    super(options.label, collapsibleState);
    this.type = options.type;
    this.description = options.description;
    this.iconPath = getIcon(options);
    this.children = options.children || [];
  }
}

function getCollapsibleState(options: NodeOptions): vscode.TreeItemCollapsibleState {
  switch (options.type) {
    case 'Path':
    case 'Type':
      return vscode.TreeItemCollapsibleState.Collapsed;
    case 'Items':
    case 'Properties':
    case 'ReflectTypes':
    case 'OneOf':
      return options.children?.length || 0 > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None;
    case 'TypePathField':
    case 'ValueField':
      return vscode.TreeItemCollapsibleState.None;
  }
}

function getIcon(options: NodeOptions): vscode.ThemeIcon | undefined {
  switch (options.type) {
    case 'Path':
      return new vscode.ThemeIcon('folder', new vscode.ThemeColor('focusBorder'));
    case 'Type':
      return new vscode.ThemeIcon('symbol-class', new vscode.ThemeColor('foreground'));
    case 'Items':
      return new vscode.ThemeIcon('symbol-array', new vscode.ThemeColor('foreground'));
    case 'Properties':
      return new vscode.ThemeIcon('symbol-field', new vscode.ThemeColor('foreground'));
    case 'ReflectTypes':
      return new vscode.ThemeIcon('symbol-type-parameter', new vscode.ThemeColor('foreground'));
    case 'OneOf':
      return new vscode.ThemeIcon('symbol-namespace', new vscode.ThemeColor('foreground'));
    case 'TypePathField':
      return new vscode.ThemeIcon('symbol-type-parameter', new vscode.ThemeColor('foreground'));
    case 'ValueField':
      return new vscode.ThemeIcon('symbol-constant', new vscode.ThemeColor('foreground'));
  }
}
