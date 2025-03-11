/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BevyRemoteService {
  get(params: BevyGetParams): Promise<BevyGetResult>;
  query(params: BevyQueryParams): Promise<BevyQueryResult>;
  spawn(params: BevySpawnParams): Promise<BevySpawnResult>;
  insert(params: BevyInsertParams): Promise<BevyInsertResult>;
  remove(params: BevyRemoveParams): Promise<BevyRemoveResult>;
  destroy(params: BevyDestroyParams): Promise<BevyDestroyResult>;
  reparent(params: BevyReparentParams): Promise<BevyReparentResult>;
  list(params?: BevyListParams): Promise<BevyListResult>;
  mutateComponent(params: BevyMutateComponentParams): Promise<BevyMutateComponentResult>;
  getWatch(params: BevyGetWatchParams): Promise<BevyGetWatchResult>;
  listWatch(params: BevyListWatchParams): Promise<BevyListWatchResult>;
  registrySchema(params?: BevyRegistrySchemaParams): Promise<BevyRegistrySchemaResult>;
}

export interface BevyError {
  code?: number;
  message?: string;
  data?: any;
}

export type EntityId = number;
export type TypePath = string;

export interface Schema {
  shortPath: string;
  typePath: TypePath;
  modulePath?: string;
  crateName?: string;
  reflectTypes?: string[];
  kind: SchemaKind;
  keyType?: Reference;
  valueType?: Reference;
  type?: SchemaType;
  additionalProperties?: boolean;
  properties?: Record<string, Reference>;
  required?: string[];
  oneOf?: (string | Schema)[];
  prefixItems?: Reference[];
  items?: false | Reference;
}

export type SchemaKind = 'Enum' | 'List' | 'Array' | 'Map' | 'Set' | 'Struct' | 'Tuple' | 'TupleStruct' | 'Value';
export type SchemaType = 'string' | 'float' | 'uint' | 'int' | 'object' | 'array' | 'boolean' | 'set';
export interface Reference {
  type: {
    $ref: string;
  };
}

export interface BevyGetParams {
  entity: EntityId;
  components: TypePath[];
  strict?: boolean;
}

export interface BevyGetLenientResult {
  components: Record<TypePath, any>;
  errors: Record<TypePath, BevyError>;
}

export type BevyGetStrictResult = Record<TypePath, any>;

export type BevyGetResult = BevyGetLenientResult | BevyGetStrictResult;

export interface BevyQueryParams {
  data: {
    components?: TypePath[];
    option?: TypePath[];
    has?: TypePath[];
  };
  filter?: {
    with?: TypePath[];
    without?: TypePath[];
  };
}

export type BevyQueryResult = {
  entity: EntityId;
  components: Record<TypePath, any>;
  has?: Record<TypePath, boolean>;
}[];

export interface BevySpawnParams {
  components: Record<TypePath, any>;
}

export interface BevySpawnResult {
  entity: EntityId;
}

export interface BevyInsertParams {
  entity: EntityId;
  components: Record<TypePath, any>;
}

export type BevyInsertResult = null;

export interface BevyRemoveParams {
  entity: EntityId;
  components: Record<TypePath, any>;
}

export type BevyRemoveResult = null;

export interface BevyDestroyParams {
  entity: EntityId;
}

export type BevyDestroyResult = null;

export interface BevyReparentParams {
  entities: EntityId[];
  parent?: EntityId;
}

export type BevyReparentResult = null;

export interface BevyListParams {
  entity: EntityId;
}

export type BevyListResult = string[];

export interface BevyMutateComponentParams {
  entity: EntityId;
  component: TypePath;
  path: string;
  value: unknown;
}

export type BevyMutateComponentResult = null;

export interface BevyGetWatchParams {
  entity: EntityId;
  components: TypePath[];
  strict?: boolean;
}

export interface BevyGetWatchResult {
  components: Record<TypePath, any>;
  removed: TypePath[];
  errors?: Record<TypePath, BevyError>;
}

export interface BevyListWatchParams {
  entity: EntityId;
}

export interface BevyListWatchResult {
  added: TypePath[];
  removed: TypePath[];
}

export interface BevyRegistrySchemaParams {
  withoutCrates?: string[];
  withCrates?: string[];
  typeLimit?: {
    without?: string[];
    with?: string[];
  };
}

export type BevyRegistrySchemaResult = Record<TypePath, Schema>;
