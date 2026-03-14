/**
 * @cp/config/messages/backend.ts
 * 
 * Backend-specific error and success messages
 * Used by Hono API handlers
 * 
 * NO HARDCODED STRINGS IN BACKEND - Import from here
 */

// ============================================
// DATA SOURCES MODULE - Backend Errors
// ============================================
export const DATA_SOURCES_BACKEND = {
    error: {
        // System
        systemNotReady: 'System not ready',
        dbNotConfigured: 'Database not configured',

        // Validation - Table
        nameTableRequired: 'Name and table name are required',
        tableNameEmpty: 'Table name cannot be empty',
        tableNameTooLong: 'Table name too long (max 64 characters)',
        tableNameReservedPrefix: (prefix: string) => `Cannot use reserved prefix: ${prefix}`,

        // Validation - Column
        columnNameEmpty: 'Column name cannot be empty',
        columnNameTooLong: 'Column name too long (max 64 characters)',
        columnNameInvalid: 'Column name must start with letter, contain only letters, numbers, underscore',
        columnNameReserved: (name: string) => `"${name}" is a SQL reserved word`,

        // Validation - Schema
        invalidSchema: 'Invalid schema',
        invalidColumnType: (type: string) => `Unknown column type: ${type}`,
        columnNameRequired: 'Column name is required',
        columnTypeRequired: 'Column type is required',
        typeRequiresValues: (type: string) => `Type "${type}" requires values to be specified`,
        typeRequiresTarget: (type: string) => `Type "${type}" requires a target table`,
        schemaRequiresColumn: 'Schema must have at least one column',
        duplicateColumnName: (name: string) => `Duplicate column name: ${name}`,
        duplicatePrimaryKey: 'Schema can only have one primary key column',

        // Validation - Row
        fieldRequired: 'This field is required',
        fieldMinValue: (min: number) => `Must be at least ${min}`,
        fieldMaxValue: (max: number) => `Must be at most ${max}`,
        fieldMinLength: (min: number) => `Must be at least ${min} characters`,
        fieldMaxLength: (max: number) => `Must be at most ${max} characters`,
        fieldInvalidFormat: 'Invalid format',
        fieldInvalidFormatType: (format: string) => `Invalid ${format} format`,
        fieldMustBeOneOf: (values: string) => `Must be one of: ${values}`,

        // CRUD
        notFound: 'Data source not found',
        invalidIds: 'Invalid IDs',
        tableExists: (name: string) => `Table "${name}" already exists`,
        tableNotFound: (name: string) => `Table "${name}" not found`,
        columnNotFound: (name: string) => `Column "${name}" not found`,
        cannotDropPrimaryKey: 'Cannot drop primary key column',
        columnNotInSchema: 'Column not found in schema metadata',
        columnRenameNotSupported: 'Column renaming not supported explicitly via modify. Drop and Add required.',

        // Resources
        resourceNotFound: 'Resource not found',
        resourceSlugExists: (slug: string) => `Resource with slug "${slug}" already exists`,

        // Relations
        relationNotFound: 'Relation not found',
        invalidRelationType: (type: string) => `Invalid relation type: ${type}`,
        targetTableRequired: 'Target table is required',
        selfRelationNotAllowed: 'Self-relation not allowed',
        invalidDataSourceId: 'Invalid data source ID',
        targetIdTypeRequired: 'targetId and type are required',
        invalidRelationTypeGeneric: (valid: string) => `Invalid relation type. Must be one of: ${valid}`,
        sourceNotFound: 'Source data source not found',
        targetNotFound: 'Target data source not found',
        relationExists: 'Relation between these data sources already exists',
        failedToListRelations: 'Failed to list relations: ',
        failedToCreateRelation: 'Failed to create relation: ',
        failedToUpdateRelation: 'Failed to update relation: ',
        failedToDeleteRelation: 'Failed to delete relation: ',
        failedToGetTargets: 'Failed to get targets: ',
        usersSystemName: 'Users (System)',

        // Data
        rowNotFound: 'Row not found',
        validationFailed: 'Validation failed',
        insertFailed: 'Failed to insert row',
        updateFailed: 'Failed to update row',
        deleteFailed: 'Failed to delete row',
        arrayOfRowsRequired: 'Array of rows required',
        arrayOfIdsRequired: 'Array of IDs required',
        noValidColumns: 'No valid columns provided',
        cannotParseDbName: 'Cannot parse database name',

        // Import/Export
        invalidJsonData: 'Invalid JSON data',
        importFailed: 'Import failed',
        exportFailed: 'Export failed',

        // Generic
        createFailed: (detail: string) => `Failed to create data source: ${detail}`,
        operationFailed: (op: string, detail: string) => `${op} failed: ${detail}`,
        cannotDestroyActive: 'Cannot destroy active data source. Archive it first.',
    },

    // Clone/copy templates
    clone: {
        description: (name: string) => `Clone of ${name}`,
        descriptionWithOriginal: (name: string, orig: string) => `Clone of ${name}. ${orig}`,
    },

    // Export filename templates  
    export: {
        filename: (name: string, ext: string) => `${name}_export.${ext}`,
    },

    success: {
        // CRUD
        created: 'Data source created successfully',
        updated: 'Data source updated',
        archived: 'Data source archived',
        restored: 'Data source restored',
        destroyed: 'Data source and table permanently deleted',

        // Schema
        columnAdded: 'Column added successfully',
        columnModified: 'Column modified successfully',
        columnDropped: 'Column dropped successfully',

        // Resources
        resourceCreated: 'Resource created successfully',
        resourceUpdated: 'Resource updated successfully',
        resourceDeleted: 'Resource deleted successfully',

        // Relations
        relationCreated: 'Relation created successfully',
        relationUpdated: 'Relation updated successfully',
        relationDeleted: 'Relation deleted successfully',

        // Data
        rowInserted: 'Row inserted successfully',
        rowUpdated: 'Row updated successfully',
        rowDeleted: 'Row deleted successfully',
        rowsDeleted: (count: number) => `${count} row(s) deleted`,
        dataImported: (count: number) => `${count} row(s) imported successfully`,
    },
} as const;

// ============================================
// COMMON BACKEND ERRORS
// ============================================
export const BACKEND_ERRORS = {
    systemNotReady: 'System not ready',
    dbNotConfigured: 'Database not configured',
    unauthorized: 'Unauthorized',
    forbidden: 'Access forbidden',
    notFound: 'Resource not found',
    validationFailed: 'Validation failed',
    internalError: 'Internal server error',
    notImplemented: 'Not implemented',
    cannotParseDbName: 'Cannot parse database name from URL',
    storageFetchFailed: (detail: string) => `Failed to fetch storage stats: ${detail}`,
    // Settings
    settingsFetchFailed: (detail: string) => `Failed to fetch settings: ${detail}`,
    settingsSaveFailed: (detail: string) => `Failed to save settings: ${detail}`,
} as const;

export const BACKEND_MESSAGES = {
    // Settings
    settingsSaved: 'Settings saved successfully',

    // Permissions
    permissions: {
        nameRequired: 'Permission name required',
        created: 'Permission created',
        deleted: 'Permission deleted',
        assigned: 'Permission assigned',
        removed: 'Permission removed',
    },

    // Roles
    roles: {
        nameRequired: 'Role name is required',
        notFound: 'Role not found',
        created: 'Role created',
        updated: 'Role updated',
        deleted: 'Role deleted',
        cannotDeleteSystem: 'Cannot delete system roles',
    },

    // Users
    users: {
        notFound: 'User not found',
        requiredFields: 'Username, email, and password are required',
        roleNotExists: 'Role does not exist. Please create it first in Role Management.',
        created: 'User created successfully',
        updated: 'User updated',
        deleted: 'User deleted',
        statusUpdated: 'User status updated',
        fetchFailed: 'Failed to fetch users',
    },

    // CORS Domains
    cors: {
        notFound: 'Domain not found',
        created: 'CORS Domain added successfully',
        deleted: 'CORS Domain deleted successfully',
        statusUpdated: 'Domain status updated successfully',
    },

    // API Keys
    apiKeys: {
        notFound: 'API Key not found',
        created: 'API Key created successfully',
        deleted: 'API Key deleted successfully',
        statusUpdated: 'API Key status updated successfully',
    },

    // Error Templates
    errorTemplates: {
        requiredFields: 'statusCode and template are required',
        created: 'Template created',
        updated: 'Template updated',
        deleted: 'Template deleted',
        notFound: 'Template not found',
        defaultFallback: 'Error',
    },

    // Auth Module
    auth: {
        invalidCredentials: 'Username atau password salah',
        accountDisabled: 'Account is disabled',
        noTokenProvided: 'No token provided',
        loginFailed: 'Login failed',
        registrationFailed: 'Registration failed',
        requiredFields: 'Username, email, and password are required',
        adminNotFound: 'Admin tidak ditemukan',
        wrongPassword: 'Password lama salah',
        usernameUpdated: 'Username berhasil diperbarui!',
        passwordChangeFailed: 'Gagal ubah password',
        profileUpdateFailed: 'Gagal update profile',
        loggedOut: 'Logged out successfully',
    },

    // API Management Module
    apiManagement: {
        invalidPath: 'Invalid path format',
        pathNotSlash: 'Path must start with /',
        pathNoDoubleSlash: 'Path cannot contain consecutive slashes',
        pathInvalidChars: 'Path contains invalid characters',
        pathNoQuery: 'Path cannot contain query string',
        invalidMethod: 'Invalid HTTP method',
        invalidCategoryId: 'Invalid category ID',
        categoryDeleted: 'Category deleted',
        categoryDeleteFailed: 'Failed to delete category',
        endpointDeleted: 'Endpoint deleted',
        endpointStatusUpdated: 'Endpoint status updated',
        missingCategoryId: 'Category ID is required',
        missingEndpointPath: 'Path is required',
    },

    // Mutation Service (CRUD Resolver)
    mutation: {
        // Success
        created: 'Record created successfully',
        updated: 'Record updated successfully',
        deleted: 'Record deleted successfully',

        // Errors
        notFound: 'Record not found',
        ownershipDenied: 'You do not have permission to modify this record',
        createFailed: 'Failed to create record',
        updateFailed: 'Failed to update record',
        deleteFailed: 'Failed to delete record',
        invalidBody: 'Invalid request body',
        missingRequiredField: (field: string) => `Missing required field: ${field}`,
        invalidFieldType: (field: string, expected: string) => `Field "${field}" must be of type ${expected}`,
        fieldTooLong: (field: string, max: number) => `Field "${field}" exceeds maximum length of ${max}`,
        invalidFormat: (field: string, format: string) => `Field "${field}" is not a valid ${format}`,
        noWritableFields: 'No writable fields provided',
        protectedFieldNotAllowed: (field: string) => `Field "${field}" cannot be modified`,
        authenticationRequired: 'Authentication required for this operation',
        schemaNotFound: 'Data source schema not found',
    },

    // System Module
    system: {
        ready: 'System is ready',
        dbUrlInvalid: 'DATABASE_URL not set',
        dbConnected: 'Database connected',
        dbConnectionFailed: 'Database connection failed',
        dbReady: 'Database is ready',
        migrationsRequired: 'Database tables not found',
        migrationSuccess: 'Migrations completed successfully',
        migrationFailed: 'Migration failed',
        adminCreated: 'Admin created successfully',
        invalidDbFormat: 'Invalid database URL format',
        urlMissingHost: 'URL must specify a host',
        urlMissingDatabase: 'Database name is required',
        providerNotSupported: 'Database provider not supported',
        tablesCreated: 'Tables created',
        tablesFailed: 'Failed to create tables',
    },
} as const;

