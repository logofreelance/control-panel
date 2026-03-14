/**
 * packages/config/src/constants.ts
 * 
 * Centralized Constants for "Nuclear Zero Hardcode" Policy
 * Includes DB Tables, SQL Keywords, API Params, etc.
 */

// ============================================
// DATABASE TABLES
// ============================================
export const DB_TABLES = {
    DATA_SOURCES: 'data_sources',
    DATA_SOURCE_COLUMNS: 'data_source_columns',
    DATA_SOURCE_RELATIONS: 'data_source_relations',
    DATA_SOURCE_MIGRATIONS: 'data_source_migrations',
    DATA_SOURCE_TEMPLATES: 'data_source_templates',
    USERS: 'users',
    API_LOGS: 'api_logs',
    SITE_SETTINGS: 'site_settings',
    INFO_SCHEMA_TABLES: 'information_schema.tables',
    INFO_SCHEMA_COLUMNS: 'information_schema.columns',
} as const;

// ============================================
// DATABASE COLUMNS (Common)
// ============================================
export const DB_COLUMNS = {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    DELETED_AT: 'deleted_at',
    NAME: 'name',
    SLUG: 'slug',
    DESCRIPTION: 'description',
    TABLE_NAME: 'table_name',
    IS_SYSTEM: 'is_system',
    IS_ARCHIVED: 'is_archived',
    VERSION: 'version',
    ROW_COUNT: 'row_count',
    SOURCE_ID: 'source_id',
    TARGET_ID: 'target_id',
    TYPE: 'type',
    ALIAS: 'alias',
    FOREIGN_KEY: 'foreign_key',
    LOCAL_KEY: 'local_key',
    PIVOT_TABLE: 'pivot_table',
    METADATA: 'metadata',
} as const;

// ============================================
// SQL KEYWORDS
// ============================================
export const SQL = {
    // DDL
    CREATE_TABLE: 'CREATE TABLE',
    DROP_TABLE: 'DROP TABLE',
    ALTER_TABLE: 'ALTER TABLE',
    ADD_COLUMN: 'ADD COLUMN',
    DROP_COLUMN: 'DROP_COLUMN',
    MODIFY_COLUMN: 'MODIFY COLUMN',
    ADD_INDEX: 'ADD INDEX',
    DROP_INDEX: 'DROP INDEX',
    IF_NOT_EXISTS: 'IF NOT EXISTS',
    IF_EXISTS: 'IF EXISTS',

    // Constraints
    PRIMARY_KEY: 'PRIMARY KEY',
    FOREIGN_KEY: 'FOREIGN KEY',
    REFERENCES: 'REFERENCES',
    NOT_NULL: 'NOT NULL',
    NULL: 'NULL',
    DEFAULT: 'DEFAULT',
    UNIQUE: 'UNIQUE',
    AUTO_INCREMENT: 'AUTO_INCREMENT',
    ON_UPDATE: 'ON UPDATE',
    ON_DELETE: 'ON DELETE',
    CASCADE: 'CASCADE',
    SET_NULL: 'SET NULL',
    CURRENT_TIMESTAMP: 'CURRENT_TIMESTAMP',

    // Aggregates
    COUNT: 'COUNT',
    SUM: 'SUM',
    AVG: 'AVG',
    MIN: 'MIN',
    MAX: 'MAX',

    // DML
    SELECT: 'SELECT',
    INSERT_INTO: 'INSERT INTO',
    UPDATE: 'UPDATE',
    DELETE_FROM: 'DELETE FROM',
    VALUES: 'VALUES',
    SET: 'SET',
    FROM: 'FROM',
    WHERE: 'WHERE',
    AND: 'AND',
    OR: 'OR',
    ORDER_BY: 'ORDER BY',
    GROUP_BY: 'GROUP_BY',
    LIMIT: 'LIMIT',
    OFFSET: 'OFFSET',
    AS: 'AS',
    JOIN: 'JOIN',
    LEFT_JOIN: 'LEFT JOIN',
    RIGHT_JOIN: 'RIGHT JOIN',
    INNER_JOIN: 'INNER JOIN',
    ON: 'ON',
    IN: 'IN',
    LIKE: 'LIKE',
    IS_NULL: 'IS NULL',
    IS_NOT_NULL: 'IS NOT NULL',
    ASC: 'ASC',
    DESC: 'DESC',
    COMMENT: 'COMMENT',

    // Literals for parameterized queries
    PLACEHOLDER: '?',
    NULL_VALUE: 'NULL',
    TRUE_VAL: '1',
    FALSE_VAL: '0',
    NOW: 'NOW()',
    LAST_INSERT_ID: 'SELECT LAST_INSERT_ID() as id',
    COMMA: ',',
    WILDCARD: '%',
} as const;

// ============================================
// SQL DATA TYPES
// ============================================
export const SQL_TYPES = {
    INT: 'INT',
    BIGINT: 'BIGINT',
    DATETIME: 'DATETIME',
    TIMESTAMP: 'TIMESTAMP',
    VARCHAR: 'VARCHAR',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    FLOAT: 'FLOAT',
    DECIMAL: 'DECIMAL',
    JSON: 'JSON',
    DATE: 'DATE',
    CHAR: 'CHAR',
    ENUM: 'ENUM',
    TRUE: 'TRUE',
    FALSE: 'FALSE',
} as const;

// ============================================
// API PARAMETERS
// ============================================
export const API_PARAMS = {
    ID: 'id',
    ROW_ID: 'rowId',
    RELATION_ID: 'rid',
    RESOURCE_ID: 'resourceId',
    USER_ID: 'userId',
    ROLE_NAME: 'roleName',
    PERM_ID: 'permId',
    NAME: 'name',
    COLUMN_NAME: 'name', // Route param :name
    TABLE_NAME: 'table', // Route param :table
    STATUS_CODE: 'statusCode', // For error templates
    PAGE: 'page',
    LIMIT: 'limit',
    SORT: 'sort',
    ORDER: 'order',
    Q: 'q',
    FILTER: 'filter',
    FIELDS: 'fields',
    INCLUDE: 'include',
} as const;

// ============================================
// HTTP METHODS
// ============================================
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;

// ============================================
// SQL OPERATORS (for safe query building)
// ============================================
export const SQL_OPERATORS = {
    EQ: '=',
    NE: '!=',
    NE_ALT: '<>',
    LT: '<',
    GT: '>',
    LE: '<=',
    GE: '>=',
    LIKE: 'LIKE',
    NOT_LIKE: 'NOT LIKE',
    IN: 'IN',
    NOT_IN: 'NOT IN',
    IS_NULL: 'IS NULL',
    IS_NOT_NULL: 'IS NOT NULL',
} as const;

export const SQL_OPERATORS_LIST = [
    '=', '!=', '<>', '<', '>', '<=', '>=',
    'LIKE', 'NOT LIKE', 'IN', 'NOT IN',
    'IS NULL', 'IS NOT NULL'
] as const;

// ============================================
// RESPONSE STATUS (for API responses)
// ============================================
export const RESPONSE_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
} as const;

// ============================================
// ROLE NAMES (for bypass checks)
// ============================================
export const ROLE_NAMES = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    USER: 'user',
    GUEST: 'guest',
} as const;

// ============================================
// CONTEXT KEYS (for Hono c.get/c.set)
// ============================================
export const CONTEXT_KEYS = {
    USER: 'user',
    API_KEY: 'apiKey',
    ENV: 'env',
} as const;

// ============================================
// ERROR SCOPES (for error templates)
// ============================================
export const ERROR_SCOPES = {
    GLOBAL: 'global',
    CATEGORY: 'category',
    ROUTE: 'route',
} as const;

// Database error patterns for checking
export const DB_ERROR_PATTERNS = {
    DUPLICATE: 'Duplicate',
} as const;

// ============================================
// OPERATION NAMES (for logging/error messages)
// ============================================
export const OPERATIONS = {
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
    CLONE: 'Clone',
    IMPORT: 'Import',
    EXPORT: 'Export',
    RESTORE: 'Restore',
    ARCHIVE: 'Archive',
    DESTROY: 'Destroy',
} as const;

// ============================================
// MUTATION ACTIONS (for audit logging)
// ============================================
export const MUTATION_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
} as const;

// ============================================
// OPERATION TYPES (for api_endpoints.operation_type)
// ============================================
export const OPERATION_TYPES = {
    READ: 'read',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
} as const;

// ============================================
// SYSTEM PROTECTED FIELDS (never writable via API)
// ============================================
export const SYSTEM_PROTECTED_FIELDS = [
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
] as const;

// ============================================
// CACHE KEYS
// ============================================
export const CACHE_KEYS = {
    DATA_SOURCE: 'ds',
    SCHEMA: 'schema',
    ROWS: 'rows',
    EDGES: 'edges',
} as const;

// ============================================
// RELATION TYPES
// ============================================
export const RELATION_TYPES = {
    BELONGS_TO: 'belongs_to',
    HAS_ONE: 'has_one',
    HAS_MANY: 'has_many',
    MANY_TO_MANY: 'many_to_many',
} as const;

// ============================================
// VALIDATION TYPES
// ============================================
export const VALIDATION_TYPES = {
    REQUIRED: 'required',
    MIN: 'min',
    MAX: 'max',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    FORMAT: 'format',
    IN: 'in',
} as const;

// ============================================
// SYSTEM IDENTIFIERS
// ============================================
export const SYSTEM = {
    MIGRATION_USER: 'system_migration',
    DEFAULT_ENGINE: 'InnoDB',
    DEFAULT_CHARSET: 'utf8mb4',
    DEFAULT_COLLATE: 'utf8mb4_unicode_ci',
    USERS_TABLE: 'users', // Specific system table
} as const;

// ============================================
// COLUMN TYPE KEYS (for type: 'xxx' in code)
// ============================================
export const COLUMN_TYPE_KEYS = {
    ID: 'id',
    UUID: 'uuid',
    STRING: 'string',
    TEXT: 'text',
    INTEGER: 'integer',
    BIGINT: 'bigint',
    DECIMAL: 'decimal',
    FLOAT: 'float',
    BOOLEAN: 'boolean',
    DATE: 'date',
    DATETIME: 'datetime',
    TIMESTAMP: 'timestamp',
    JSON: 'json',
    ENUM: 'enum',
    SLUG: 'slug',
    EMAIL: 'email',
    PHONE: 'phone',
    URL: 'url',
    RELATION: 'relation',
    IMAGE: 'image',
    FILE: 'file',
    STATUS: 'status',
} as const;

// ============================================
// TABLE PREFIXES
// ============================================
export const TABLE_PREFIXES = {
    USER: 'usr_',
    SYSTEM: 'sys_',
    PIVOT: 'pivot_',
    MIGRATION: 'mig_',
    COPY_SUFFIX: '_copy_',
} as const;

// ============================================
// EXPORT FORMATS
// ============================================
export const EXPORT_FORMATS = {
    JSON: 'json',
    CSV: 'csv',
    XLSX: 'xlsx',
} as const;

// ============================================
// CONTENT TYPES (HTTP)
// ============================================
export const CONTENT_TYPES = {
    JSON: 'application/json',
    CSV: 'text/csv',
    HTML: 'text/html',
    TEXT: 'text/plain',
    FORM: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
} as const;

// ============================================
// CLONE/COPY LABELS
// ============================================
export const CLONE_LABELS = {
    PREFIX: 'Copy of ',
    SUFFIX: ' (Clone)',
} as const;

// ============================================
// HTTP HEADERS
// ============================================
export const HTTP_HEADERS = {
    CONTENT_TYPE: 'Content-Type',
    CONTENT_DISPOSITION: 'Content-Disposition',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
    CACHE_CONTROL: 'Cache-Control',
    X_FORWARDED_FOR: 'x-forwarded-for',
    X_REAL_IP: 'x-real-ip',
    USER_AGENT: 'user-agent',
    X_API_KEY: 'x-api-key',
} as const;

// ============================================
// STRING PATTERNS (for singularize/pluralize)
// ============================================
export const STRING_PATTERNS = {
    // Plural suffixes
    SUFFIX_IES: 'ies',
    SUFFIX_ES: 'es',
    SUFFIX_S: 's',
    SUFFIX_SS: 'ss',
    // Singular replacements
    SUFFIX_Y: 'y',
    // FK/table naming
    FK_PREFIX: 'fk_',
    ID_SUFFIX: '_id',
} as const;

// ============================================
// CRYPTO / KEY GENERATION
// ============================================
export const CRYPTO = {
    ENCODING: {
        HEX: 'hex',
        BASE64: 'base64',
        UTF8: 'utf8',
    },
    KEY_PREFIX: {
        PUBLIC: 'pk_',
        SECRET: 'sk_',
    },
    BYTES: {
        API_KEY: 24,
    },
} as const;
