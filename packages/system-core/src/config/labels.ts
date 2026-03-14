/**
 * System Core Labels
 * Centralized user-facing strings and error messages for i18n support.
 */
export const CORE_LABELS = {
    ERRORS: {
        INVALID_TABLE_CONFIG: 'Invalid table configuration',
        ADMIN_EXISTS: 'Admin already exists',
        DB_URL_INVALID: 'Database URL is invalid',
        INVALID_DB_FORMAT: 'Invalid database URL format',
        DB_CONNECTION_FAILED: 'Database connection failed',
        MIGRATION_FAILED: 'Migration failed',
        REQUIRED_FIELDS: 'Required fields missing',
        DB_NOT_CONFIGURED: 'Database URL not configured'
    },
    MESSAGES: {
        DB_READY: 'Database is ready',
        ADMIN_CREATED: 'Admin created successfully',
        MIGRATION_SUCCESS: 'Migration completed successfully',
        UPDATED: 'Updated successfully',
        CREATED: 'Created successfully',
        DELETED: 'Deleted successfully',
        DEFAULT_FALLBACK: 'An error occurred',
        ROLES_CHECK: 'roles table check/create completed',
        TEMPLATES_CHECK: 'api_error_templates table check/create completed',
        MIN_ROLE_ADDED: 'min_role_level column added',
        DESC_ADDED: 'description column added',
        ROLES_EXISTS: 'min_role_level column already exists',
        DESC_EXISTS: 'description column already exists',
        PARAM_AUTO_ADD: 'Parameter %s akan ditambahkan otomatis',
        MIN_ROLE_ERROR: 'min_role_level: %s',
        DESC_ERROR: 'description: %s',
        INVALID_FORMAT: '(invalid format)',
        PARSE_ERROR: '(parse error)',
        UNKNOWN_ERROR: 'Unknown connection error'
    },
    TEMPLATES: {
        UNAUTHORIZED: 'Unauthorized',
        FORBIDDEN: 'Forbidden',
        NOT_FOUND: 'Not Found',
        SERVER_ERROR: 'Server Error'
    },
    LOGS: {
        ROLES_ERROR: 'Roles table creation error (ignored):',
        TEMPLATES_ERROR: 'Error templates table creation error (ignored):'
    }
};
