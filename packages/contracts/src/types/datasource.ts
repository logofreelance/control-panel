/**
 * @modular/contracts - DataSource Specific Types
 * Types used by system-datasource package
 */

import type { DataSourceColumn, DataSourceSchema } from './entities';

// Re-export for convenience
export type { DataSourceColumn, DataSourceSchema };

/**
 * Validation rule definition
 */
export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom' | string;
    value?: any;
    message?: string;
}

/**
 * Column validation rules
 */
export interface ColumnValidation {
    [columnName: string]: ValidationRule[];
}

/**
 * Resource field mapping
 */
export interface ResourceFields {
    [fieldName: string]: string | boolean | {
        column: string;
        alias?: string;
        transform?: string;
    };
}

/**
 * Resource filter definition
 */
export interface ResourceFilter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
    value?: any;
    required?: boolean;
}

/**
 * Resource relation definition
 */
export interface ResourceRelation {
    name: string;
    type: 'hasOne' | 'hasMany' | 'belongsTo';
    target: string;
    foreignKey?: string;
    localKey?: string;
}

/**
 * Resource aggregate definition
 */
export interface ResourceAggregate {
    name: string;
    function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    field: string;
    alias?: string;
}

/**
 * Resource computed field
 */
export interface ResourceComputed {
    name: string;
    expression: string;
    alias?: string;
}

/**
 * Resource join definition
 */
export interface ResourceJoin {
    table: string;
    type: 'inner' | 'left' | 'right';
    on: string;
    alias?: string;
}

/**
 * Resource definition for API endpoints
 */
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

/**
 * Reserved prefixes for system tables
 */
export const RESERVED_PREFIXES = ['sys_', 'app_', '_'] as const;

/**
 * User table prefix
 */
export const USER_TABLE_PREFIX = 'udt_';

/**
 * SQL reserved words
 */
export const SQL_RESERVED_WORDS = [
    'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter',
    'table', 'index', 'view', 'database', 'schema', 'grant', 'revoke',
    'from', 'where', 'order', 'group', 'having', 'join', 'on', 'as',
    'and', 'or', 'not', 'in', 'like', 'between', 'is', 'null', 'true', 'false',
    'primary', 'foreign', 'key', 'references', 'unique', 'check', 'default',
    'constraint', 'cascade', 'set', 'values', 'into', 'limit', 'offset'
] as const;

/**
 * Check if a word is reserved
 */
export function isReservedWord(word: string): boolean {
    return SQL_RESERVED_WORDS.includes(word.toLowerCase() as any);
}

/**
 * Relation type enum
 */
export type RelationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'manyToMany';

/**
 * Data operation result
 */
export interface DataOperationResult {
    success: boolean;
    message: string;
    affectedRows?: number;
    insertId?: number;
}

