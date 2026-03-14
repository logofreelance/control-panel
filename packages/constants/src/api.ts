// packages/constants/src/api.ts
// Centralized API routes constants

/**
 * API Layer paths
 * MANAGEMENT = Control Panel admin layer
 * PUBLIC = Backend System public API layer
 */
export const API_LAYERS = {
    MANAGEMENT: '/api',
    PUBLIC: '/api',
} as const;

/**
 * Authentication routes
 */
export const AUTH_ROUTES = {
    LOGIN: '/login',
    LOGOUT: '/logout',
    ME: '/me',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
} as const;

/**
 * Resource routes (relative to layer)
 */
export const RESOURCE_ROUTES = {
    USERS: '/users',
    ROLES: '/roles',
    PERMISSIONS: '/permissions',
    API_KEYS: '/api-keys',
    CORS_DOMAINS: '/cors',
    SETTINGS: '/settings',
    STORAGE: '/storage',
    STORAGE_STATS: '/storage-stats',
    DATA_SOURCES: '/data-sources',
    API_MANAGEMENT: '/api-management',
    MONITOR: '/monitor',
    ERROR_TEMPLATES: '/error-templates',
    SYSTEM_STATUS: '/system-status',
} as const;

/**
 * Helper: Build full Management API URL
 * @param baseUrl - API base URL from environment
 * @param path - Resource path
 */
export const buildApiUrl = (baseUrl: string, path: string): string =>
    `${baseUrl}${API_LAYERS.MANAGEMENT}${path}`;

/**
 * Helper: Build full Backend System URL
 * @param baseUrl - API base URL from environment
 * @param path - Resource path
 */
export const buildBackendSystemUrl = (baseUrl: string, path: string): string =>
    `${baseUrl}${API_LAYERS.PUBLIC}${path}`;

// Type exports
export type ApiLayer = typeof API_LAYERS[keyof typeof API_LAYERS];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type ResourceRoute = typeof RESOURCE_ROUTES[keyof typeof RESOURCE_ROUTES];
