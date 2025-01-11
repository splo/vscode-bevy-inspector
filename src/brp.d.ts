export interface BevyRemoteService {
    get(params: BevyGetParams): Promise<BevyGetResult>;
    query(params: BevyQueryParams): Promise<BevyQueryResult>;
    spawn(params: BevySpawnParams): Promise<BevySpawnResult>;
    destroy(params: BevyDestroyParams): Promise<BevyDestroyResult>;
    remove(params: BevyRemoveParams): Promise<BevyRemoveResult>;
    insert(params: BevyInsertParams): Promise<BevyInsertResult>;
    reparent(params: BevyReparentParams): Promise<BevyReparentResult>;
    list(params?: BevyListParams): Promise<BevyListResult>;
    getWatch(params: BevyGetWatchParams): Promise<BevyGetWatchResult>;
    listWatch(params: BevyListWatchParams): Promise<BevyListWatchResult>;
}

export interface BevyError {
    code?: number;
    message?: string;
    data?: any;
}

export type EntityId = number;
export type ComponentName = string;

export type BevyGetParams = {
    entity: EntityId;
    components: ComponentName[];
    strict?: boolean;
};

export type BevyGetLenientResult = {
    components: Record<ComponentName, any>;
    errors: Record<ComponentName, BevyError>;
};

export type BevyGetStrictResult = Record<ComponentName, any>;

export type BevyGetResult = BevyGetLenientResult | BevyGetStrictResult;

export type BevyQueryParams = {
    data: {
        components?: ComponentName[];
        option?: ComponentName[];
        has?: ComponentName[];
    };
    filter?: {
        with?: ComponentName[];
        without?: ComponentName[];
    };
};

export type BevyQueryResult = {
    entity: EntityId;
    components: Record<ComponentName, any>;
    has?: Record<ComponentName, boolean>;
}[];

export type BevySpawnParams = {
    components: Record<ComponentName, any>;
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
    components: Record<ComponentName, any>;
};

export type BevyRemoveResult = null;

export type BevyInsertParams = {
    entity: EntityId;
    components: Record<ComponentName, any>;
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

export type BevyGetWatchParams = {
    entity: EntityId;
    components: ComponentName[];
    strict?: boolean;
};

export type BevyGetWatchResult = {
    components: Record<ComponentName, any>;
    removed: ComponentName[];
    errors?: Record<ComponentName, BevyError>;
};

export type BevyListWatchParams = {
    entity: EntityId;
};

export type BevyListWatchResult = {
    added: ComponentName[];
    removed: ComponentName[];
};
