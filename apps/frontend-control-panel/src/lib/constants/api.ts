// packages/constants/src/api.ts
// Centralized API routes constants

/**
 * API Layer paths
 * ORANGE = Management/Admin layer (Control Panel)
 * GREEN = Public/Client layer (Frontend Apps)
 */
export const API_LAYERS = {
    ORANGE: '/orange',
    GREEN: '/green',
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
    DATABASE_SCHEMA: '/database-schema',
    MONITOR_ANALYTICS: '/monitor-analytics',
    MONITOR_DATABASE: '/monitor-database',
    ERROR_TEMPLATES: '/error-templates',
    SYSTEM_STATUS: '/system-status',
} as const;

/**
 * Helper: Build full Orange layer URL
 * @param baseUrl - API base URL from environment
 * @param path - Resource path
 */
export const buildOrangeUrl = (baseUrl: string, path: string): string =>
    `${baseUrl}${API_LAYERS.ORANGE}${path}`;

/**
 * Helper: Build full Green layer URL
 * @param baseUrl - API base URL from environment
 * @param path - Resource path
 */
export const buildGreenUrl = (baseUrl: string, path: string): string =>
    `${baseUrl}${API_LAYERS.GREEN}${path}`;

// Type exports
export type ApiLayer = typeof API_LAYERS[keyof typeof API_LAYERS];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type ResourceRoute = typeof RESOURCE_ROUTES[keyof typeof RESOURCE_ROUTES];
