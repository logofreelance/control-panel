/**
 * packages/system-datasource/src/types/index.ts
 * Internalized Types for Zero-Dependency
 */

export interface DataSourceColumn {
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    default?: any;

    // Size & precision
    length?: number;
    precision?: number;
    scale?: number;

    // Enum values
    values?: string[];

    // DDL properties
    nullable?: boolean;
    isPrimary?: boolean;
    hasDefault?: boolean;
    defaultValue?: string;
    comment?: string;

    // Relation properties
    target?: number | string;
    relationType?: 'hasOne' | 'hasMany' | 'belongsTo' | string;
    alias?: string;
    relationTarget?: number | string;
}

export interface DataSourceSchema {
    columns: DataSourceColumn[];
    timestamps?: boolean;
    softDelete?: boolean;
}

export interface DataSource {
    id: number;
    name: string;
    type: string;
    tableName: string;
    schemaJson: string;
    validationJson?: string;
    rowCount?: number;
    version?: number;
    isSystem?: boolean;
    isArchived: boolean; // Explicitly required now
    prefix?: string;
    createdAt: Date;
    updatedAt: Date;
    // Parsed/computed properties
    schema?: DataSourceSchema;
    description?: string;
    validation?: Record<string, any>;
}

// Alias for backward compatibility
export type ColumnDefinition = DataSourceColumn;

export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom' | string;
    value?: any;
    message?: string;
}

export interface ResourceFields {
    [fieldName: string]: string | boolean | {
        column: string;
        alias?: string;
        transform?: string;
    };
}

export interface ResourceFilter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
    value?: any;
    required?: boolean;
}

export interface ResourceRelation {
    name: string;
    type: 'hasOne' | 'hasMany' | 'belongsTo';
    target: string;
    foreignKey?: string;
    localKey?: string;
}

export interface ResourceAggregate {
    name: string;
    function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    field: string;
    alias?: string;
}

export interface ResourceComputed {
    name: string;
    expression: string;
    alias?: string;
}

export interface ResourceJoin {
    table: string;
    type: 'inner' | 'left' | 'right';
    on: string;
    alias?: string;
}

export interface ResourceDefinition {
    id?: number;
    name: string;
    slug?: string;
    description?: string;

    // Field mapping
    fields?: ResourceFields;

    // Query configuration
    filters?: ResourceFilter[];
    relations?: ResourceRelation[];
    aggregates?: ResourceAggregate[];
    computed?: ResourceComputed[];
    joins?: ResourceJoin[];

    // Ordering
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC' | string;

    // Pagination
    defaultLimit?: number;
    maxLimit?: number;

    // Security
    isPublic?: boolean;
    requiredRoles?: string | null;
    requiredPermissions?: string | null;
}

// User context for Hono
export interface UserContext {
    id: number;
    username: string;
    email: string;
    role: string;
    permissions: string[];
    level?: number;
    authenticated?: boolean;
}

export const RESERVED_PREFIXES = ['sys_', 'app_', '_'] as const;
export const USER_TABLE_PREFIX = 'udt_';

export const SQL_RESERVED_WORDS = [
    'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter',
    'table', 'index', 'view', 'database', 'schema', 'grant', 'revoke',
    'from', 'where', 'order', 'group', 'having', 'join', 'on', 'as',
    'and', 'or', 'not', 'in', 'like', 'between', 'is', 'null', 'true', 'false',
    'primary', 'foreign', 'key', 'references', 'unique', 'check', 'default',
    'constraint', 'cascade', 'set', 'values', 'into', 'limit', 'offset'
] as const;

export function isReservedWord(word: string): boolean {
    return SQL_RESERVED_WORDS.includes(word.toLowerCase() as any);
}

export * from './repository';

