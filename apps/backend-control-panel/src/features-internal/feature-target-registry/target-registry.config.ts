/**
 * feature-target-registry — Configuration Constants
 * 
 * 🤖 AI CONTEXT:
 * - "target system" = external system managed by this Control Panel
 * - "internal" = Control Panel's own data
 * - This feature handles CRUD registration of target systems
 */

export const TARGET_REGISTRY_ROUTE_PATHS = {
    list: '/',
    create: '/',
    update: '/:id',
    delete: '/:id',
    testConnection: '/test-connection',
    healthCheck: '/:id/health',
} as const;

export const TARGET_SYSTEM_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    UNKNOWN: 'unknown',
    ERROR: 'error',
} as const;

export type TargetSystemStatus = typeof TARGET_SYSTEM_STATUS[keyof typeof TARGET_SYSTEM_STATUS];
