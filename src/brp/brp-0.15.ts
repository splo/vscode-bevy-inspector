/** Entity identifier in the ECS. */
export type EntityId = number;

/** Full path of a type, e.g. "bevy_transform::components::transform::Transform". */
export type TypePath = string;

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

  /** Watch the values of one or more components from an entity. */
  getWatch(params: GetWatchParams): Promise<GetWatchResult>;

  /** Watch all components present on an entity. */
  listWatch(params: ListWatchParams): Promise<ListWatchResult>;
}

/** Represents an error returned by the Bevy Remote Protocol. */
export interface BrpError {
  code?: number;
  message?: string;
  data?: unknown;
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
