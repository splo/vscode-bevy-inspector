/**
 * Service interface for interacting with the Bevy Remote Protocol.
 * Provides methods for querying and manipulating Bevy ECS components and resources.
 */
export interface BevyRemoteService {
  /** Retrieve the values of one or more components from an entity. */
  get(params: BevyGetStrictParams): Promise<BevyGetStrictResult>;
  get(params: BevyGetLenientParams): Promise<BevyGetLenientResult>;

  /** Perform a query over components in the ECS, returning entities and component values that match. */
  query(params: BevyQueryParams): Promise<BevyQueryResult>;

  /** Create a new entity with the provided components and return the resulting entity ID. */
  spawn(params: BevySpawnParams): Promise<BevySpawnResult>;

  /** Insert one or more components into an entity. */
  insert(params: BevyInsertParams): Promise<BevyInsertResult>;

  /** Delete one or more components from an entity. */
  remove(params: BevyRemoveParams): Promise<BevyRemoveResult>;

  /** Despawn the entity with the given ID. */
  destroy(params: BevyDestroyParams): Promise<BevyDestroyResult>;

  /** Assign a new parent to one or more entities. */
  reparent(params: BevyReparentParams): Promise<BevyReparentResult>;

  /** List all registered components or all components present on an entity. */
  list(params?: BevyListParams): Promise<BevyListResult>;

  /** Mutate a field in a component. */
  mutateComponent(params: BevyMutateComponentParams): Promise<BevyMutateComponentResult>;

  /** Watch the values of one or more components from an entity. */
  getWatch(params: BevyGetWatchParams): Promise<BevyGetWatchResult>;

  /** Watch all components present on an entity. */
  listWatch(params: BevyListWatchParams): Promise<BevyListWatchResult>;

  /** Extract the value of a given resource from the world. */
  getResource(params: BevyGetResourceParams): Promise<BevyGetResourceResult>;

  /** Insert the given resource into the world with the given value. */
  insertResource(params: BevyInsertResourceParams): Promise<BevyInsertResourceResult>;

  /** Remove the given resource from the world. */
  removeResource(params: BevyRemoveResourceParams): Promise<BevyRemoveResourceResult>;

  /** Mutate a field in a resource. */
  mutateResource(params: BevyMutateResourceParams): Promise<BevyMutateResourceResult>;

  /** List all reflectable registered resource types. */
  listResources(params: BevyListResourcesParams): Promise<BevyListResourcesResult>;

  /** Return schema information about registered types. */
  registrySchema(params?: BevyRegistrySchemaParams): Promise<BevyRegistrySchemaResult>;

  /** Discover available RPC methods. */
  discover(params: RpcDiscoverParams): Promise<RpcDiscoverResult>;
}

/** Represents an error returned by the Bevy Remote Protocol. */
export interface BevyError {
  code?: number;
  message?: string;
  data?: unknown;
}

/** Entity identifier in the ECS. */
export type EntityId = number;

/** Full path of a type, e.g. "bevy_transform::components::transform::Transform". */
export type TypePath = string;

/** Schema information about a Bevy type. */
export interface Schema {
  /** Short path of the type. */
  shortPath: string;
  /** Full path of the type. */
  typePath: TypePath;
  /** Path of the module that type is part of. */
  modulePath?: string;
  /** Name of the crate that type is part of. */
  crateName?: string;
  /** Names of the types that type reflects. */
  reflectTypes?: string[];
  /** TypeInfo type mapping. */
  kind: SchemaKind;
  /** Provided when kind is Map. Contains type info of key of the Map. */
  keyType?: Reference;
  /** Provided when kind is Map. Contains type info of value of the Map. */
  valueType?: Reference;
  /** Specifies the data type for a schema. Fundamental to JSON Schema. */
  type?: SchemaType;
  /**
   * Validation behavior depends on "properties" and "patternProperties".
   * Applies only to child values of instance names not in those annotations.
   */
  additionalProperties?: boolean;
  /**
   * Validation succeeds if, for each name in both instance and this keyword,
   * the child instance validates against the corresponding schema.
   */
  properties?: Record<string, Reference>;
  /** Validation succeeds if every item in the array is a property name in the instance. */
  required?: string[];
  /** Validation succeeds if the instance validates against exactly one schema defined here. */
  oneOf?: (string | Schema)[];
  /**
   * Validation succeeds if each element validates against the schema at the same position.
   * Does not constrain array length. For longer arrays, validates only the matching prefix.
   */
  prefixItems?: Reference[];
  /**
   * Applies subschema to all instance elements at indexes greater than "prefixItems" length.
   * If no such annotation exists, applies to all instance array elements.
   */
  items?: false | Reference;
}

/** The kind of schema element. */
export type SchemaKind = 'Enum' | 'List' | 'Array' | 'Map' | 'Set' | 'Struct' | 'Tuple' | 'TupleStruct' | 'Value';

/** The primitive type of a schema element. */
export type SchemaType = 'string' | 'float' | 'uint' | 'int' | 'object' | 'array' | 'boolean' | 'set';

/** A reference to another type in the schema. */
export interface Reference {
  type: {
    $ref: string;
  };
}

export interface BevyGetLenientParams {
  entity: EntityId;
  components: TypePath[];
  strict?: false;
}

export interface BevyGetStrictParams {
  entity: EntityId;
  components: TypePath[];
  strict: true;
}

export type BevyGetParams = BevyGetLenientParams | BevyGetStrictParams;

export interface BevyGetLenientResult {
  components: Record<TypePath, unknown>;
  errors: Record<TypePath, BevyError>;
}

export type BevyGetStrictResult = Record<TypePath, unknown>;

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
  strict?: boolean;
}

export type BevyQueryResult = {
  entity: EntityId;
  components: Record<TypePath, unknown>;
  has?: Record<TypePath, boolean>;
}[];

export interface BevySpawnParams {
  components: Record<TypePath, unknown>;
}

export interface BevySpawnResult {
  entity: EntityId;
}

export interface BevyInsertParams {
  entity: EntityId;
  components: Record<TypePath, unknown>;
}

export type BevyInsertResult = void;

export interface BevyRemoveParams {
  entity: EntityId;
  components: TypePath[];
}

export type BevyRemoveResult = void;

export interface BevyDestroyParams {
  entity: EntityId;
}

export type BevyDestroyResult = void;

export interface BevyReparentParams {
  entities: EntityId[];
  parent?: EntityId;
}

export type BevyReparentResult = void;

export interface BevyListParams {
  entity: EntityId;
}

export type BevyListResult = TypePath[];

export interface BevyMutateComponentParams {
  entity: EntityId;
  component: TypePath;
  path: string;
  value: unknown;
}

export type BevyMutateComponentResult = void;

export interface BevyGetWatchParams {
  entity: EntityId;
  components: TypePath[];
  strict?: boolean;
}

export interface BevyGetWatchResult {
  components: Record<TypePath, unknown>;
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

export interface BevyGetResourceParams {
  resource: TypePath;
}

export interface BevyGetResourceResult {
  value: unknown;
  error?: BevyError;
}

export interface BevyInsertResourceParams {
  resource: TypePath;
  value: unknown;
}

export type BevyInsertResourceResult = void;

export interface BevyRemoveResourceParams {
  resource: TypePath;
}

export type BevyRemoveResourceResult = void;

export interface BevyMutateResourceParams {
  resource: TypePath;
  path: string;
  value: unknown;
}

export type BevyMutateResourceResult = void;

export type BevyListResourcesParams = void;

export type BevyListResourcesResult = TypePath[];

export interface BevyRegistrySchemaParams {
  withoutCrates?: string[];
  withCrates?: string[];
  typeLimit?: {
    without?: string[];
    with?: string[];
  };
}

export type BevyRegistrySchemaResult = Record<TypePath, Schema>;

export type RpcDiscoverParams = void;

export interface RpcDiscoverResult {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  methods: {
    name: string;
    params: unknown[];
  }[];
  openrpc: string;
  servers: {
    name: string;
    url: string;
    description?: string;
  }[];
}
