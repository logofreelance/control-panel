// data-sources/types/index.ts
// Frontend types for Data Sources

export interface ColumnDefinition {
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    default?: string | number | boolean;
    length?: number;
    precision?: number;
    scale?: number;
    values?: string[];
    target?: string;
}

export interface DataSourceSchema {
    columns: ColumnDefinition[];
    timestamps?: boolean;
    softDelete?: boolean;
}

export interface DataSource {
    id: number;
    name: string;
    tableName: string;
    description?: string;
    schema?: DataSourceSchema;
    schemaJson?: string;
    prefix?: string;
    isSystem?: boolean;
    isArchived?: boolean;
    rowCount?: number;
    version?: number;
    createdAt?: string;
    updatedAt?: string;
    resourceCount?: number;
    deletedAt?: string; // For trash items
}

export interface Resource {
    id: number;
    dataSourceId: number;
    name: string;
    slug?: string;
    description?: string;
    fieldsJson?: string;
    filtersJson?: string;
    relationsJson?: string;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    defaultLimit?: number;
    maxLimit?: number;
    isPublic?: boolean;
    isActive?: boolean;
    aggregatesJson?: string;
    computedJson?: string;
    joinsJson?: string;
}

export interface JoinConfig {
    table: string;
    alias?: string;
    type?: 'LEFT' | 'INNER' | 'RIGHT';
    on: [string, string];
}

// Note: ColumnType moved to registry/column-types.ts
// Note: COLUMN_TYPES moved to registry/column-types.ts

