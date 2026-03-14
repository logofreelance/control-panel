/**
 * packages/system-datasource/src/config/constants.ts
 *
 * Centralized Constants for System Datasource
 * "Nuclear Zero Hardcode" Policy
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
// STRING PATTERNS (for singularize/pluralize)
// ============================================
export const STRING_PATTERNS = {
    SUFFIX_IES: 'ies',
    SUFFIX_ES: 'es',
    SUFFIX_S: 's',
    SUFFIX_SS: 'ss',
    SUFFIX_Y: 'y',
    FK_PREFIX: 'fk_',
    ID_SUFFIX: '_id',
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
    OWNER_ID: 'owner_id',
    UNIQUE_PAIR: 'unique_pair',
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
// SYSTEM IDENTIFIERS
// ============================================
export const SYSTEM = {
    MIGRATION_USER: 'system_migration',
    DEFAULT_ENGINE: 'InnoDB',
    DEFAULT_CHARSET: 'utf8mb4',
    DEFAULT_COLLATE: 'utf8mb4_unicode_ci',
    USERS_TABLE: 'users', // Specific system table
    USERS_NAME: 'System Users',
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
// SYSTEM PROTECTED FIELDS (never writable via API)
// ============================================
export const SYSTEM_PROTECTED_FIELDS = [
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
] as const;

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
// SECURITY LIMITS
// ============================================
export const SECURITY_LIMITS = {
    MAX_BULK_ITEMS: 1000,
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE_SIZE: 20,
    MAX_IDENTIFIER_LENGTH: 64,
} as const; // Default values if not strictly migrated

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
// API PARAM KEYS (to replace hardcoded strings in handlers)
// ============================================
export const API_PARAM_KEYS = {
    ROW_ID: 'rowId',
    RELATION_NAME: 'relationName',
    RESOURCE_ID: 'resourceId',
    COLUMN_NAME: 'columnName',
    TRUE: 'true',
    FALSE: 'false',
    ID: 'id',
} as const;

// ============================================
// SYSTEM DEFAULTS
// ============================================
export const SYSTEM_DEFAULTS = {
    DEFAULT_LIMIT: 100,
    MAX_LIMIT: 1000,
    DEFAULT_ORDER: 'DESC',
    DEFAULT_PAGE: 1,
    LENGTH: 255,
    PRECISION: 10,
    SCALE: 2,
} as const;

export const REGEX_PATTERNS = {
    SLUG: /[^a-z0-9]+/g,
    TABLE_NAME: /[^a-z0-9_]/g,
} as const;

export const URL_PREFIXES = {
    API: '/api',
} as const;

export const SQL_PLACEHOLDERS = {
    LENGTH: '{{length}}',
    PRECISION: '{{precision}}',
    SCALE: '{{scale}}',
    VALUES: '{{values}}',
} as const;

export const CHARS = {
    UNDERSCORE: '_',
    SLASH: '/',
    SPACE: ' ',
    COMMA: ',',
    ASTERISK: '*',
    HYPHEN: '-',
    COLON: ':',
    EMPTY: '',
    SINGLE_QUOTE: "'",
    BACKSLASH: '\\',
    PERCENT: '%',
} as const;

export const HEADERS = {
    X_FORWARDED_FOR: 'x-forwarded-for',
    X_REAL_IP: 'x-real-ip',
    USER_AGENT: 'user-agent',
} as const;

export const JS_TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    UNDEFINED: 'undefined',
    FUNCTION: 'function',
    SYMBOL: 'symbol',
    BIGINT: 'bigint',
} as const;

export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;


export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    FAIL: 'fail',
} as const;

export const RESERVED_WORDS = [
    'select', 'delete', 'update', 'insert', 'drop', 'alter', 'create', 'table',
    'index', 'view', 'trigger', 'procedure', 'function', 'database', 'schema',
    'user', 'role', 'group', 'permission', 'system', 'config', 'settings'
] as const;

export const ERROR_SCOPES = {
    GLOBAL: 'global',
    ROUTE: 'route',
    CATEGORY: 'category',
} as const;

export const CONTEXT_KEYS = {
    USER: 'user',
    REQUEST_ID: 'requestId',
} as const;

export const HEADER_KEYS = HEADERS;
