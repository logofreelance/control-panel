import { mysqlTable, serial, text, varchar, int, boolean, timestamp, bigint } from 'drizzle-orm/mysql-core';

// 1. Sites Table - Management of Frontend Clients & Dynamic CORS
export const sites = mysqlTable('sites', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    url: varchar('url', { length: 255 }).notNull().unique(), // The URL used for Dynamic CORS check
    isActive: boolean('is_active').default(true),
    databaseId: int('database_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 2. Databases Table - Management of Database Pool
export const databases = mysqlTable('databases', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    host: varchar('host', { length: 255 }).notNull(),
    port: int('port').default(4000), // TiDB Cloud default port
    user: varchar('user', { length: 255 }).notNull(),
    password: text('password').notNull(), // This will be encrypted AES-256
    dbName: varchar('db_name', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).default('healthy'), // healthy, down
    storageUsed: bigint('storage_used', { mode: 'number' }).default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 3. Admin Users - Who can access the Orange Layer Control Panel
export const adminUsers = mysqlTable('admin_users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// 3.1 Roles - Role definitions with hierarchy and super bypass
export const roles = mysqlTable('roles', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    displayName: varchar('display_name', { length: 100 }),
    description: text('description'),
    level: int('level').default(0),              // Higher = more access (super_admin=100, admin=90, user=10)
    isSuper: boolean('is_super').default(false), // Bypass all route validations
    permissions: text('permissions'),            // JSON array of default permissions for this role
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 3.2 API Error Templates - Customizable error responses
export const apiErrorTemplates = mysqlTable('api_error_templates', {
    id: serial('id').primaryKey(),
    scope: varchar('scope', { length: 20 }).default('global'), // 'global', 'route', 'category'
    scopeId: int('scope_id'),                                   // null=global, or route/category id
    statusCode: int('status_code').notNull(),                   // 401, 403, 404, 500
    template: text('template').notNull(),                       // JSON template
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 4. Site Settings - Global Branding & SEO
export const siteSettings = mysqlTable('site_settings', {
    id: serial('id').primaryKey(),
    siteName: varchar('site_name', { length: 255 }).default('Modular Engine'),
    siteTitle: varchar('site_title', { length: 255 }).default('Dashboard'),
    metaDescription: text('meta_description'),
    faviconUrl: text('favicon_url'),
    primaryColor: varchar('primary_color', { length: 20 }).default('#059669'), // Emerald-600 default
    configVersion: int('config_version').default(1),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 4.1 Node Health Metrics - For Multi-node monitoring and Service Discovery
export const nodeHealthMetrics = mysqlTable('node_health_metrics', {
    id: serial('id').primaryKey(),
    nodeId: varchar('node_id', { length: 255 }).notNull().unique(),
    endpointUrl: varchar('endpoint_url', { length: 255 }).notNull(),
    cpuUsage: varchar('cpu_usage', { length: 50 }), // percentage or string
    memoryUsage: varchar('memory_usage', { length: 50 }), // percentage or string
    uptime: int('uptime'), // in seconds
    status: varchar('status', { length: 50 }).default('online'),
    lastHeartbeat: timestamp('last_heartbeat').defaultNow().onUpdateNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

// 5. API Keys - For secure data delivery access
export const apiKeys = mysqlTable('api_keys', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    key: varchar('key', { length: 255 }).notNull().unique(),
    roles: text('roles'), // Roles assigned to this key (e.g. admin, guest)
    permissions: text('permissions'), // Specific permissions (e.g. read:stats)
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    lastUsedAt: timestamp('last_used_at'),
});

// 6. CORS Domains - Allowed origins for delivery
export const corsDomains = mysqlTable('cors_domains', {
    id: serial('id').primaryKey(),
    domain: varchar('domain', { length: 255 }).notNull().unique(), // e.g., https://example.com
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// 7. API Logs - For monitoring & analytics
export const apiLogs = mysqlTable('api_logs', {
    id: serial('id').primaryKey(),
    apiKeyId: int('api_key_id'),
    endpoint: varchar('endpoint', { length: 255 }),
    method: varchar('method', { length: 10 }),
    statusCode: int('status_code'),
    durationMs: int('duration_ms'),
    origin: varchar('origin', { length: 255 }),
    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 8. API Categories - Groups of routes with shared permissions
export const apiCategories = mysqlTable('api_categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    roles: text('roles'), // Comma-separated roles allowed
    permissions: text('permissions'), // Comma-separated permissions allowed
    createdAt: timestamp('created_at').defaultNow(),
});

// 9. API Endpoints - Dynamic route definitions
export const apiEndpoints = mysqlTable('api_endpoints', {
    id: serial('id').primaryKey(),
    categoryId: int('category_id'),
    dataSourceId: int('data_source_id'), // FK to data_sources, NULL = static response
    resourceId: int('resource_id'), // FK to data_source_resources
    path: varchar('path', { length: 255 }).notNull(), // e.g., /v1/users
    method: varchar('method', { length: 10 }).default('GET'), // GET, POST, PUT, DELETE
    description: text('description'), // Endpoint description
    responseData: text('response_data'), // JSON template for response with placeholders
    roles: text('roles'), // Required roles (comma-separated)
    permissions: text('permissions'), // Required permissions (comma-separated)
    minRoleLevel: int('min_role_level').default(0), // 0=public, 10=user, 50=moderator, 90=admin
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),

    // NOTE: These columns need database migration before uncommenting:
    // validationRules: text('validation_rules'),       // JSON: { "fieldName": "required,minLength:3,maxLength:100" }
    // errorTemplatesJson: text('error_templates_json'), // JSON: { "401": "{...}", "403": "{...}" }

    // Write Operation Config (for POST/PUT/DELETE)
    operationType: varchar('operation_type', { length: 20 }).default('read'), // read, create, update, delete
    writableFields: text('writable_fields'), // JSON array of allowed fields for write
    protectedFields: text('protected_fields'), // JSON array of protected fields (never writable)
    autoPopulateFields: text('auto_populate_fields'), // JSON object {field: source} e.g. {"user_id": "{{USER_ID}}"}

    // Ownership Config (for UPDATE/DELETE)
    ownershipColumn: varchar('ownership_column', { length: 64 }), // e.g., "user_id" for owner check
    allowOwnerOnly: boolean('allow_owner_only').default(true), // If true, only owner can modify
});

// ==================== USER-BASED RBAC SYSTEM ====================

// 10. Users - End users who access the Green Layer API
export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).default('user'), // user|designer|admin|affiliator|super_admin
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 11. Permissions - Granular permission definitions (action:resource format)
export const permissions = mysqlTable('permissions', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(), // e.g., read:products, create:orders
    group: varchar('group', { length: 50 }), // e.g., products, orders, users
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 12. User Permissions - Junction table for many-to-many
export const userPermissions = mysqlTable('user_permissions', {
    id: serial('id').primaryKey(),
    userId: int('user_id').notNull(),
    permissionId: int('permission_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// 13. Data Sources - Tables that can be queried by dynamic routes (Enhanced v3)
export const dataSources = mysqlTable('data_sources', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    tableName: varchar('table_name', { length: 255 }).notNull().unique(),
    description: text('description'),

    // Schema definition (JSON)
    schemaJson: text('schema_json'),           // Column definitions
    indexesJson: text('indexes_json'),         // Index definitions
    constraintsJson: text('constraints_json'), // Unique, Check constraints
    relationsJson: text('relations_json'),     // Foreign key definitions
    validationJson: text('validation_json'),   // Per-field validation rules

    // Legacy columns (for backward compatibility)
    selectableColumns: text('selectable_columns'),
    filterableColumns: text('filterable_columns'),

    // Metadata
    prefix: varchar('prefix', { length: 10 }).default('usr_'),
    isSystem: boolean('is_system').default(false),
    isArchived: boolean('is_archived').default(false),
    rowCount: int('row_count').default(0),

    // Versioning & Audit
    version: int('version').default(1),
    createdBy: int('created_by'),
    updatedBy: int('updated_by'),
    archivedAt: timestamp('archived_at'),

    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 14. Data Source Resources - API-ready views/queries (Enhanced v3)
export const dataSourceResources = mysqlTable('data_source_resources', {
    id: serial('id').primaryKey(),
    dataSourceId: int('data_source_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }),       // URL-friendly identifier
    description: text('description'),

    // Query Definition (JSON)
    fieldsJson: text('fields_json'),              // Selected columns
    filtersJson: text('filters_json'),            // WHERE conditions
    joinsJson: text('joins_json'),                // JOIN other sources (legacy)
    relationsJson: text('relations_json'),        // Included relations from data_source_relations
    aggregatesJson: text('aggregates_json'),      // GROUP BY, COUNT, SUM
    computedFieldsJson: text('computed_fields_json'), // Calculated columns

    // Legacy columns
    fields: text('fields'),
    filters: text('filters'),

    // Query Config
    orderBy: varchar('order_by', { length: 255 }),
    orderDirection: varchar('order_direction', { length: 4 }).default('DESC'),
    defaultLimit: int('default_limit').default(100),
    maxLimit: int('max_limit').default(1000),
    limit: int('limit').default(100), // Legacy

    // Caching
    cacheTtl: int('cache_ttl').default(0),        // 0 = no cache
    cacheKey: varchar('cache_key', { length: 255 }),

    // Access Control
    isPublic: boolean('is_public').default(false),
    requiredRoles: text('required_roles'),
    requiredPermissions: text('required_permissions'),

    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 15. Data Source Relations - Smart relationships between data sources
export const dataSourceRelations = mysqlTable('data_source_relations', {
    id: serial('id').primaryKey(),
    sourceId: int('source_id').notNull(),           // Data source that owns the relation
    targetId: int('target_id').notNull(),           // Target data source
    type: varchar('type', { length: 20 }).notNull(), // belongs_to, has_one, has_many, many_to_many

    // Key configuration
    localKey: varchar('local_key', { length: 100 }),     // FK column in source table (for belongs_to)
    foreignKey: varchar('foreign_key', { length: 100 }).default('id'), // Key in target table

    // For many-to-many relations
    pivotTable: varchar('pivot_table', { length: 255 }), // Auto-generated pivot table name
    pivotSourceKey: varchar('pivot_source_key', { length: 100 }), // e.g., profile_id
    pivotTargetKey: varchar('pivot_target_key', { length: 100 }), // e.g., tag_id

    // Metadata
    alias: varchar('alias', { length: 100 }),        // Alias for response (e.g., "user", "tags")
    description: text('description'),

    // Audit
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

// 16. Data Source Migrations - Schema change history
export const dataSourceMigrations = mysqlTable('data_source_migrations', {
    id: serial('id').primaryKey(),
    dataSourceId: int('data_source_id').notNull(),
    version: int('version').notNull(),
    action: varchar('action', { length: 20 }).notNull(), // CREATE, ADD_COLUMN, DROP_COLUMN, etc
    changesJson: text('changes_json').notNull(),
    executedDdl: text('executed_ddl'),
    rollbackDdl: text('rollback_ddl'),
    status: varchar('status', { length: 20 }).default('PENDING'), // PENDING, SUCCESS, FAILED, ROLLED_BACK
    errorMessage: text('error_message'),
    executedAt: timestamp('executed_at'),
    executedBy: int('executed_by'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 17. Data Source Templates - Quick start templates
export const dataSourceTemplates = mysqlTable('data_source_templates', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }),  // 'ecommerce', 'blog', 'crm', etc
    icon: varchar('icon', { length: 10 }),
    schemaJson: text('schema_json').notNull(),
    sampleDataJson: text('sample_data_json'),
    isSystem: boolean('is_system').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// 18. API Mutation Logs - Audit trail for all write operations
export const apiMutationLogs = mysqlTable('api_mutation_logs', {
    id: serial('id').primaryKey(),
    endpointId: int('endpoint_id'),
    userId: int('user_id'),
    action: varchar('action', { length: 20 }), // CREATE, UPDATE, DELETE
    tableName: varchar('table_name', { length: 100 }),
    recordId: int('record_id'),
    beforeData: text('before_data'), // JSON snapshot before change
    afterData: text('after_data'), // JSON snapshot after change
    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

// ==================== SECURITY TABLES ====================

// 19. Login Attempts - Track login attempts for rate limiting
export const loginAttempts = mysqlTable('login_attempts', {
    id: serial('id').primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(), // email or username
    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),
    success: boolean('success').default(false),
    failureReason: varchar('failure_reason', { length: 100 }), // invalid_password, account_disabled, rate_limited
    createdAt: timestamp('created_at').defaultNow(),
});

// 20. Sessions - Lucia Auth session storage
export const sessions = mysqlTable('sessions', {
    id: varchar('id', { length: 255 }).primaryKey(), // Lucia requires string ID
    userId: int('user_id').notNull().references(() => users.id),
    expiresAt: timestamp('expires_at').notNull(),
});
