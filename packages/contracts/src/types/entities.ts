/**
 * @modular/contracts - Shared Entity Types
 */

export interface User {
    id: number;
    username: string;
    email: string;
    passwordHash?: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[];
}

export interface Role {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    level: number;
    isSuper: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiKey {
    id: number;
    name: string;
    key: string;
    roles?: string | null;
    permissions?: string | null;
    isActive: boolean | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    lastUsedAt?: Date | null;
}

export interface SiteSettings {
    id?: number;
    siteName: string;
    siteTitle?: string;
    siteDescription?: string | null;
    metaDescription?: string | null;
    siteUrl?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    updatedAt?: Date | null;
}

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

    // Relation properties - use string | number for ID reference compatibility
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
    createdAt: Date;
    updatedAt: Date;
    // Parsed/computed properties
    schema?: DataSourceSchema;
    description?: string;
    validation?: Record<string, any>;
}

// Alias for backward compatibility
export type ColumnDefinition = DataSourceColumn;

