import type { EntityId, TypePath } from './types';

/**
 * Service interface for interacting with the Bevy Remote Protocol.
 * Provides methods for querying and manipulating Bevy ECS components and resources.
 */
export interface BevyRemoteService {
  /** Retrieve the values of one or more components from an entity. */
  get(params: GetStrictParams): Promise<GetStrictResult>;
  get(params: GetLenientParams): Promise<GetLenientResult>;

  /** Perform a query over components in the ECS, returning entities and component values that match. */
  query(params: QueryParams): Promise<QueryResult>;

  /** Create a new entity with the provided components and return the resulting entity ID. */
  spawn(params: SpawnParams): Promise<SpawnResult>;

  /** Insert one or more components into an entity. */
  insert(params: InsertParams): Promise<InsertResult>;

  /** Delete one or more components from an entity. */
  remove(params: RemoveParams): Promise<RemoveResult>;

  /** Despawn the entity with the given ID. */
  destroy(params: DestroyParams): Promise<DestroyResult>;

  /** Assign a new parent to one or more entities. */
  reparent(params: ReparentParams): Promise<ReparentResult>;

  /** List all registered components or all components present on an entity. */
  list(params?: ListParams): Promise<ListResult>;

  /** Mutate a field in a component. */
  mutateComponent(params: MutateComponentParams): Promise<MutateComponentResult>;

  /** Watch the values of one or more components from an entity. */
  getWatch(params: GetWatchParams): Promise<GetWatchResult>;

  /** Watch all components present on an entity. */
  listWatch(params: ListWatchParams): Promise<ListWatchResult>;

  /** Extract the value of a given resource from the world. */
  getResource(params: GetResourceParams): Promise<GetResourceResult>;

  /** Insert the given resource into the world with the given value. */
  insertResource(params: InsertResourceParams): Promise<InsertResourceResult>;

  /** Remove the given resource from the world. */
  removeResource(params: RemoveResourceParams): Promise<RemoveResourceResult>;

  /** Mutate a field in a resource. */
  mutateResource(params: MutateResourceParams): Promise<MutateResourceResult>;

  /** List all reflectable registered resource types. */
  listResources(params: ListResourcesParams): Promise<ListResourcesResult>;

  /** Return schema information about registered types. */
  registrySchema(params?: RegistrySchemaParams): Promise<RegistrySchemaResult>;

  /** Discover available RPC methods. */
  discover(params: RpcDiscoverParams): Promise<RpcDiscoverResult>;
}

/** Represents an error returned by the Bevy Remote Protocol. */
export interface BrpError {
  code?: number;
  message?: string;
  data?: unknown;
}

/** Schema information about a Bevy type. */
export interface BrpSchema {
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
  oneOf?: (string | BrpSchema)[];
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

export interface GetLenientParams {
  entity: EntityId;
  components: TypePath[];
  strict?: false;
}

export interface GetStrictParams {
  entity: EntityId;
  components: TypePath[];
  strict: true;
}

export type GetParams = GetLenientParams | GetStrictParams;

export interface GetLenientResult {
  components: Record<TypePath, unknown>;
  errors: Record<TypePath, BrpError>;
}

export type GetStrictResult = Record<TypePath, unknown>;

export type GetResult = GetLenientResult | GetStrictResult;

export interface QueryParams {
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

export type QueryResult = {
  entity: EntityId;
  components: Record<TypePath, unknown>;
  has?: Record<TypePath, boolean>;
}[];

export interface SpawnParams {
  components: Record<TypePath, unknown>;
}

export interface SpawnResult {
  entity: EntityId;
}

export interface InsertParams {
  entity: EntityId;
  components: Record<TypePath, unknown>;
}

export type InsertResult = void;

export interface RemoveParams {
  entity: EntityId;
  components: TypePath[];
}

export type RemoveResult = void;

export interface DestroyParams {
  entity: EntityId;
}

export type DestroyResult = void;

export interface ReparentParams {
  entities: EntityId[];
  parent?: EntityId;
}

export type ReparentResult = void;

export interface ListParams {
  entity: EntityId;
}

export type ListResult = TypePath[];

export interface MutateComponentParams {
  entity: EntityId;
  component: TypePath;
  path: string;
  value: unknown;
}

export type MutateComponentResult = void;

export interface GetWatchParams {
  entity: EntityId;
  components: TypePath[];
  strict?: boolean;
}

export interface GetWatchResult {
  components: Record<TypePath, unknown>;
  removed: TypePath[];
  errors?: Record<TypePath, BrpError>;
}

export interface ListWatchParams {
  entity: EntityId;
}

export interface ListWatchResult {
  added: TypePath[];
  removed: TypePath[];
}

export interface GetResourceParams {
  resource: TypePath;
}

export interface GetResourceResult {
  value: unknown;
  error?: BrpError;
}

export interface InsertResourceParams {
  resource: TypePath;
  value: unknown;
}

export type InsertResourceResult = void;

export interface RemoveResourceParams {
  resource: TypePath;
}

export type RemoveResourceResult = void;

export interface MutateResourceParams {
  resource: TypePath;
  path: string;
  value: unknown;
}

export type MutateResourceResult = void;

export type ListResourcesParams = void;

export type ListResourcesResult = TypePath[];

export interface RegistrySchemaParams {
  withoutCrates?: string[];
  withCrates?: string[];
  typeLimit?: {
    without?: string[];
    with?: string[];
  };
}

export type RegistrySchemaResult = Record<TypePath, BrpSchema>;

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
