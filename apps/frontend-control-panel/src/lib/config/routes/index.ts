/**
 * packages/config/src/routes/index.ts
 * 
 * CENTRALIZED API ROUTES - Single Source of Truth
 * ALL API endpoints MUST be defined here
 */

// Orange Layer Routes (Admin/Management)
export const ORANGE_ROUTES = {
    base: '/orange',

    // Authentication
    auth: {
        login: '/orange/login',
        updateProfile: '/orange/update-profile',
        changePassword: '/orange/change-password',
    },

    // System
    system: {
        status: '/orange/system-status',
        install: '/orange/install',
        validateDb: '/orange/validate-db-url',
        setupDb: '/orange/setup-db',
    },

    // Database Schema
    databaseSchema: {
        list: '/orange/database-schema',
        save: '/orange/database-schema',
        delete: (id: string) => `/orange/database-schema/${id}`,
        test: '/orange/database-schema/test-connection',
        resources: (id: string) => `/orange/database-schema/${id}/resources`,
        columns: (id: string) => `/orange/database-schema/${id}/columns`,
    },

    // Resources (API endpoints for data sources)
    resources: {
        list: '/orange/resources',
        create: '/orange/resources',
        detail: (id: number | string) => `/orange/resources/${id}`,
        update: (id: number | string) => `/orange/resources/${id}`,
        delete: (id: number | string) => `/orange/resources/${id}`,
    },

    // Users
    users: {
        list: '/orange/users',
        create: '/orange/users',
        detail: (id: number | string) => `/orange/users/${id}`,
        update: (id: number | string) => `/orange/users/${id}`,
        delete: (id: number | string) => `/orange/users/${id}`,
    },

    // Roles & Permissions
    rolesPermissions: {
        base: '/orange/roles-permissions',
        roles: '/orange/roles',
        permissions: '/orange/permissions',
    },

    // API Keys
    apiKeys: {
        list: '/orange/api-keys',
        create: '/orange/api-keys',
        detail: (id: number | string) => `/orange/api-keys/${id}`,
        delete: (id: number | string) => `/orange/api-keys/${id}`,
        toggle: (id: number | string) => `/orange/api-keys/${id}/toggle`,
        revoke: (id: number | string) => `/orange/api-keys/${id}/revoke`,
    },

    // CORS
    cors: {
        list: '/orange/cors',
        create: '/orange/cors',
        delete: (id: number | string) => `/orange/cors/${id}`,
        toggle: (id: number | string) => `/orange/cors/${id}/toggle`,
    },

    // Settings
    settings: {
        list: '/orange/settings',
        update: '/orange/settings',
        get: (key: string) => `/orange/settings/${key}`,
    },

    // Storage
    storage: {
        stats: '/orange/storage/stats',
        cleanup: '/orange/storage/cleanup',
        deleteTable: (name: string) => `/orange/storage/tables/${name}`,
        // File operations
        fileStats: '/orange/storage/files/stats',
        files: '/orange/storage/files',
        upload: '/orange/storage/files/upload',
        folders: '/orange/storage/folders',
        download: (id: number) => `/orange/storage/files/${id}/download`,
        deleteFile: (id: number) => `/orange/storage/files/${id}`,
    },

    // API Management
    apiManagement: {
        categories: '/orange/api-management/categories',
        endpoints: '/orange/api-management/endpoints',
        logs: '/orange/api-management/logs',
    },

    // Monitor Analytics
    monitorAnalytics: {
        stats: '/orange/monitor-analytics',
        health: '/orange/monitor-analytics',
        metrics: '/orange/monitor-analytics/metrics',
    },

    // Monitor Database
    monitorDatabase: {
        stats: '/orange/monitor-database/stats',
        tables: '/orange/monitor-database/tables',
        cleanup: '/orange/monitor-database/cleanup',
    },

    // Error Templates
    errorTemplates: {
        list: '/orange/error-templates',
        detail: (id: number | string) => `/orange/error-templates/${id}`,
    },
} as const;

// Green Layer Routes (Public API)
export const GREEN_ROUTES = {
    base: '/green',

    // Dynamic resource endpoint
    resource: (name: string) => `/green/${name}`,
    resourceDetail: (name: string, id: number | string) => `/green/${name}/${id}`,

    // Auth (public facing)
    auth: {
        login: '/green/auth/login',
        register: '/green/auth/register',
        logout: '/green/auth/logout',
        refresh: '/green/auth/refresh',
        forgotPassword: '/green/auth/forgot-password',
        resetPassword: '/green/auth/reset-password',
    },
} as const;

// Combined routes export
export const ROUTES = {
    orange: ORANGE_ROUTES,
    green: GREEN_ROUTES,
} as const;

export type OrangeRoutes = typeof ORANGE_ROUTES;
export type GreenRoutes = typeof GREEN_ROUTES;
export type Routes = typeof ROUTES;
