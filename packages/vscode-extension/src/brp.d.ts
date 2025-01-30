export interface BevyRemoteService {
  get(params: BevyGetParams): Promise<BevyGetResult>;
  query(params: BevyQueryParams): Promise<BevyQueryResult>;
  spawn(params: BevySpawnParams): Promise<BevySpawnResult>;
  destroy(params: BevyDestroyParams): Promise<BevyDestroyResult>;
  remove(params: BevyRemoveParams): Promise<BevyRemoveResult>;
  insert(params: BevyInsertParams): Promise<BevyInsertResult>;
  reparent(params: BevyReparentParams): Promise<BevyReparentResult>;
  list(params?: BevyListParams): Promise<BevyListResult>;
  registrySchema(params?: BevyRegistrySchemaParams): Promise<BevyRegistrySchemaResult>;
  getWatch(params: BevyGetWatchParams): Promise<BevyGetWatchResult>;
  listWatch(params: BevyListWatchParams): Promise<BevyListWatchResult>;
}

export interface BevyError {
  code?: number;
  message?: string;
  data?: any;
}

export type EntityId = number;
export type TypePath = string;

export type Schema = {
  shortPath: string;
  typePath: TypePath;
  modulePath?: string;
  crateName?: string;
  reflectTypes?: string[];
  kind: SchemaKind;
  keyType?: Schema;
  valueType?: Schema;
  type: SchemaType;
  additionalProperties?: boolean;
  properties?: Record<string, Schema>;
  required?: string[];
  oneOf?: Schema[];
  prefixItems?: Schema[];
  items?: Schema | boolean;
};

export type SchemaKind = 'Enum' | 'List' | 'Map' | 'Set' | 'Struct' | 'Tuple' | 'TupleStruct' | 'Value';
export type SchemaType = 'string' | 'float' | 'uint' | 'int' | 'object' | 'array' | 'boolean' | 'set' | Ref;
export type Ref = { $ref: string };

export type BevyGetParams = {
  entity: EntityId;
  components: TypePath[];
  strict?: boolean;
};

export type BevyGetLenientResult = {
  components: Record<TypePath, any>;
  errors: Record<TypePath, BevyError>;
};

export type BevyGetStrictResult = Record<TypePath, any>;

export type BevyGetResult = BevyGetLenientResult | BevyGetStrictResult;

export type BevyQueryParams = {
  data: {
    components?: TypePath[];
    option?: TypePath[];
    has?: TypePath[];
  };
  filter?: {
    with?: TypePath[];
    without?: TypePath[];
  };
};

export type BevyQueryResult = {
  entity: EntityId;
  components: Record<TypePath, any>;
  has?: Record<TypePath, boolean>;
}[];

export type BevySpawnParams = {
  components: Record<TypePath, any>;
};

export type BevySpawnResult = {
  entity: EntityId;
};

export type BevyDestroyParams = {
  entity: EntityId;
};

export type BevyDestroyResult = null;

export type BevyRemoveParams = {
  entity: EntityId;
  components: Record<TypePath, any>;
};

export type BevyRemoveResult = null;

export type BevyInsertParams = {
  entity: EntityId;
  components: Record<TypePath, any>;
};

export type BevyInsertResult = null;

export type BevyReparentParams = {
  entities: EntityId[];
  parent?: EntityId;
};

export type BevyReparentResult = null;

export type BevyListParams = {
  entity: EntityId;
};

export type BevyListResult = string[];

export type BevyRegistrySchemaParams = {
  withoutCrates?: string[];
  withCrates?: string[];
  typeLimit?: {
    without?: string[];
    with?: string[];
  };
};

export type BevyRegistrySchemaResult = Record<TypePath, Schema>;

export type BevyGetWatchParams = {
  entity: EntityId;
  components: TypePath[];
  strict?: boolean;
};

export type BevyGetWatchResult = {
  components: Record<TypePath, any>;
  removed: TypePath[];
  errors?: Record<TypePath, BevyError>;
};

export type BevyListWatchParams = {
  entity: EntityId;
};

export type BevyListWatchResult = {
  added: TypePath[];
  removed: TypePath[];
};
