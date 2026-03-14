/**
 * packages/config/src/routes/index.ts
 * 
 * CENTRALIZED API ROUTES - Single Source of Truth
 * ALL API endpoints MUST be defined here
 */

// API Layer Routes (Management)
export const API_ROUTES = {
    base: '/api',

    // Authentication
    auth: {
        login: '/api/login',
        updateProfile: '/api/update-profile',
        changePassword: '/api/change-password',
    },

    // System
    system: {
        status: '/api/system-status',
        install: '/api/install',
        validateDb: '/api/validate-db-url',
        setupDb: '/api/setup-db',
    },

    // Data Sources
    dataSources: {
        list: '/api/data-sources',
        stats: '/api/data-sources/stats',
        create: '/api/data-sources',
        detail: (id: number | string) => `/api/data-sources/${id}`,
        update: (id: number | string) => `/api/data-sources/${id}`,
        delete: (id: number | string) => `/api/data-sources/${id}`,
        schema: (id: number | string) => `/api/data-sources/${id}/schema`,
        data: (id: number | string) => `/api/data-sources/${id}/data`,
        clone: (id: number | string) => `/api/data-sources/${id}/clone`,
        archive: (id: number | string) => `/api/data-sources/${id}/archive`,
        restore: (id: number | string) => `/api/data-sources/${id}/restore`,
        resources: (id: number | string) => `/api/data-sources/${id}/resources`,
        columns: (id: number | string) => `/api/data-sources/${id}/columns`,
    },

    // Resources (API endpoints for data sources)
    resources: {
        list: '/api/resources',
        create: '/api/resources',
        detail: (id: number | string) => `/api/resources/${id}`,
        update: (id: number | string) => `/api/resources/${id}`,
        delete: (id: number | string) => `/api/resources/${id}`,
    },

    // Users
    users: {
        list: '/api/users',
        create: '/api/users',
        detail: (id: number | string) => `/api/users/${id}`,
        update: (id: number | string) => `/api/users/${id}`,
        delete: (id: number | string) => `/api/users/${id}`,
    },

    // Roles
    roles: {
        list: '/api/roles',
        create: '/api/roles',
        detail: (id: number | string) => `/api/roles/${id}`,
        update: (id: number | string) => `/api/roles/${id}`,
        delete: (id: number | string) => `/api/roles/${id}`,
    },

    // Permissions
    permissions: {
        list: '/api/permissions',
        create: '/api/permissions',
        detail: (id: number | string) => `/api/permissions/${id}`,
    },

    // API Keys
    apiKeys: {
        list: '/api/api-keys',
        create: '/api/api-keys',
        detail: (id: number | string) => `/api/api-keys/${id}`,
        delete: (id: number | string) => `/api/api-keys/${id}`,
        toggle: (id: number | string) => `/api/api-keys/${id}/toggle`,
        revoke: (id: number | string) => `/api/api-keys/${id}/revoke`,
    },

    // CORS
    cors: {
        list: '/api/cors',
        create: '/api/cors',
        delete: (id: number | string) => `/api/cors/${id}`,
        toggle: (id: number | string) => `/api/cors/${id}/toggle`,
    },

    // Settings
    settings: {
        list: '/api/settings',
        update: '/api/settings',
        get: (key: string) => `/api/settings/${key}`,
    },

    // Storage
    storage: {
        stats: '/api/storage/stats',
        cleanup: '/api/storage/cleanup',
        deleteTable: (name: string) => `/api/storage/tables/${name}`,
        // File operations
        fileStats: '/api/storage/files/stats',
        files: '/api/storage/files',
        upload: '/api/storage/files/upload',
        folders: '/api/storage/folders',
        download: (id: number) => `/api/storage/files/${id}/download`,
        deleteFile: (id: number) => `/api/storage/files/${id}`,
    },

    // API Management
    apiManagement: {
        categories: '/api/api-management/categories',
        endpoints: '/api/api-management/endpoints',
        logs: '/api/api-management/logs',
    },

    // Monitor
    monitor: {
        stats: '/api/monitor',
        health: '/api/monitor',
        metrics: '/api/monitor/metrics',
    },

    // Error Templates
    errorTemplates: {
        list: '/api/error-templates',
        detail: (id: number | string) => `/api/error-templates/${id}`,
    },
} as const;

// Backend System Routes (Public API)
export const BACKEND_SYSTEM_ROUTES = {
    base: '/backend-system',

    // Dynamic resource endpoint
    resource: (name: string) => `/backend-system/${name}`,
    resourceDetail: (name: string, id: number | string) => `/backend-system/${name}/${id}`,

    // Auth (public facing)
    auth: {
        login: '/backend-system/auth/login',
        register: '/backend-system/auth/register',
        logout: '/backend-system/auth/logout',
        refresh: '/backend-system/auth/refresh',
        forgotPassword: '/backend-system/auth/forgot-password',
        resetPassword: '/backend-system/auth/reset-password',
    },
} as const;

// Combined routes export
export const ROUTES = {
    api: API_ROUTES,
    backendSystem: BACKEND_SYSTEM_ROUTES,
} as const;

export type ApiRoutes = typeof API_ROUTES;
export type BackendSystemRoutes = typeof BACKEND_SYSTEM_ROUTES;
export type Routes = typeof ROUTES;
