export interface EndpointData {
    id?: number;
    path: string;
    method: string;
    description?: string;
    categoryId?: number;
    dataSourceId?: number;
    resourceId?: number;
    responseData?: string;
    roles?: string;
    permissions?: string;
    minRoleLevel?: number;
    isActive?: boolean;
    operationType?: string;
    writableFields?: string;
    protectedFields?: string;
    autoPopulateFields?: string;
    ownershipColumn?: string;
    allowOwnerOnly?: boolean;
}

export interface EndpointStats {
    total: number;
    active: number;
    categories: number;
    methods: number;
}

export interface IApiEndpointsRepository {
    list(): Promise<any[]>;
    save(data: EndpointData): Promise<void>;
    delete(id: number): Promise<void>;
    getById(id: number): Promise<any>;
    getStats(): Promise<EndpointStats>;
    checkDuplicate(path: string, method: string, excludeId?: number): Promise<{ exists: boolean }>;
    toggle(id: number): Promise<void>;
}

// --- API Keys ---
export interface CreateApiKeyDTO {
    name: string;
    roles?: string;
    permissions?: string;
}

export interface ApiKeyData {
    id?: number;
    name: string;
    key: string;
    roles?: string;
    permissions?: string;
    isActive?: boolean;
    createdAt?: Date;
}

export interface IApiKeysRepository {
    findAll(): Promise<ApiKeyData[]>;
    create(data: ApiKeyData): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<ApiKeyData | null>;
    update(id: number, data: Partial<ApiKeyData>): Promise<void>;
}

// --- Categories ---
export interface CategoryData {
    id?: number;
    name: string;
    description?: string;
}

export interface IApiCategoriesRepository {
    findAll(): Promise<CategoryData[]>;
    save(data: CategoryData): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<CategoryData | null>;
    hasChildren(id: number): Promise<boolean>;
}

// --- CORS ---
export interface CorsDomainData {
    id?: number;
    domain: string;
    isActive?: boolean;
}

export interface ICorsRepository {
    findAll(): Promise<CorsDomainData[]>;
    save(domain: string): Promise<void>;
    delete(id: number): Promise<void>;
    toggle(id: number): Promise<void>;
    findById(id: number): Promise<CorsDomainData | null>;
}

// --- Logs ---
export interface LogData {
    id?: number;
    path: string;
    method: string;
    statusCode: number;
    duration: number;
    ip?: string;
    userAgent?: string;
    createdAt?: Date;
}

export interface IApiLogsRepository {
    list(limit: number): Promise<LogData[]>;
    save(data: LogData): Promise<void>;
}
