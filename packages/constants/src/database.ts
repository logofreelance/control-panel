// packages/constants/src/database.ts
// Centralized database constants

/**
 * Table prefix constants for different table categories
 */
export const TABLE_PREFIX = {
    /** User-created data source tables */
    USER: 'usr_',
    /** System tables (internal use) */
    SYSTEM: 'sys_',
    /** Admin/management tables */
    ADMIN: 'admin_',
    /** API-related tables */
    API: 'api_',
    /** Site configuration tables */
    SITE: 'site_',
    /** Core framework tables */
    CORE: 'core_',
} as const;

/**
 * Reserved prefixes that users cannot use for their tables
 */
export const RESERVED_PREFIXES = [
    'sys_',
    'admin_',
    'api_',
    'user_',
    'site_',
    'core_',
    'data_source',
] as const;

/**
 * SQL reserved words that cannot be used as column/table names
 */
export const SQL_RESERVED_WORDS = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
    'ALTER', 'TABLE', 'INDEX', 'DATABASE', 'SCHEMA', 'PRIMARY', 'FOREIGN', 'KEY',
    'REFERENCES', 'CONSTRAINT', 'UNIQUE', 'NOT', 'NULL', 'DEFAULT', 'AUTO_INCREMENT',
    'AND', 'OR', 'IN', 'LIKE', 'BETWEEN', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT',
    'OFFSET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS', 'ON', 'AS',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'ALL', 'ANY', 'EXISTS',
] as const;

/**
 * Helper: Check if a name is a reserved word
 */
export const isReservedWord = (name: string): boolean =>
    SQL_RESERVED_WORDS.includes(name.toUpperCase() as typeof SQL_RESERVED_WORDS[number]);

/**
 * Helper: Check if a prefix is reserved
 */
export const isReservedPrefix = (name: string): boolean =>
    RESERVED_PREFIXES.some(prefix => name.toLowerCase().startsWith(prefix));

/**
 * Helper: Add user table prefix
 */
export const withUserPrefix = (tableName: string): string =>
    `${TABLE_PREFIX.USER}${tableName}`;

// Type exports
export type TablePrefixKey = keyof typeof TABLE_PREFIX;
export type ReservedPrefix = typeof RESERVED_PREFIXES[number];
export type SqlReservedWord = typeof SQL_RESERVED_WORDS[number];
