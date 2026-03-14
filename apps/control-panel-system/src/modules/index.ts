// modules/index.ts
// Control Panel API - Module Aggregator
// With Security: Rate Limiting, Admin Audit Logging

import { Hono } from 'hono';
// import { sql } from 'drizzle-orm'; // Removed to avoid conflict with @modular/database
import { APP_LABELS } from '../config/labels';

// Security middleware
import { globalRateLimiter, adminLoginRateLimiter } from '@cp/middleware';
import { adminAuditMiddleware, getAuditLogs } from '@cp/middleware';

// Import domain routers
import { systemRouter } from './system';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { apiKeysRouter } from './api-keys';
import { corsRouter } from './cors';
import { settingsRouter } from './settings';
import { storageRouter } from './storage';
import { permissionsRouter } from './permissions';
import { apiManagementRouter } from './api-management';
import { monitorRouter } from './monitor';
import { dataSourceRoutes as dataSourcesRouter } from './data-sources';

export const modulesRouter = new Hono();

// ============================================
// GLOBAL SECURITY MIDDLEWARE FOR API LAYER
// ============================================

// 1. Global Rate Limiting (100 req/min per IP)
// 1. Global Rate Limiting (100 req/min per IP)
modulesRouter.use('*', globalRateLimiter);

// 2. Admin Audit Logging (for write operations)
modulesRouter.use('*', adminAuditMiddleware);

// ============================================
// ROUTES
// ============================================

// CSRF token endpoint (must be before other routes to set cookie)
// CSRF token endpoint (must be before other routes to set cookie)
import { getCsrfToken } from '@cp/middleware';
modulesRouter.get('/csrf-token', getCsrfToken);

// System routes (at root level for /system-status, /setup-db, /install, /validate-db-url)
modulesRouter.route('/', systemRouter);

// Auth routes
modulesRouter.route('/', authRouter);

// Users management
modulesRouter.route('/users', usersRouter);

// API Keys management
modulesRouter.route('/api-keys', apiKeysRouter);

// CORS domains management (also support /cors for legacy)
modulesRouter.route('/cors', corsRouter);

// Settings management
modulesRouter.route('/settings', settingsRouter);

// Storage stats & operations
modulesRouter.route('/storage', storageRouter);

// Permissions management
modulesRouter.route('/permissions', permissionsRouter);

// API Management (categories, endpoints, logs)
modulesRouter.route('/api-management', apiManagementRouter);

// Monitoring
modulesRouter.route('/monitor', monitorRouter);

// Data Sources
modulesRouter.route('/data-sources', dataSourcesRouter);

// Roles management
import { rolesRouter } from './roles';
modulesRouter.route('/roles', rolesRouter);

// Error Templates management
import { errorTemplatesRouter } from './error-templates';
modulesRouter.route('/error-templates', errorTemplatesRouter);

// ============================================
// ADMIN-ONLY ENDPOINTS
// ============================================

// Health/Status endpoint
modulesRouter.get('/status', (c) => c.json({
    layer: APP_LABELS.MODULES.SYSTEM.LAYER,
    status: APP_LABELS.STATUS.ONLINE,
    timestamp: new Date().toISOString(),
}));

// API layer health check - using centralized ENV gateway
modulesRouter.get('/health', async (c) => {
    const { getEnv } = await import('@cp/config');
    const env = getEnv(c);
    const dbConfigured = !!env.DATABASE_URL;

    return c.json({
        status: dbConfigured ? APP_LABELS.STATUS.OK : APP_LABELS.STATUS.DEGRADED,
        layer: APP_LABELS.MODULES.SYSTEM.LAYER,
        database: {
            configured: dbConfigured,
        },
        timestamp: new Date().toISOString(),
    });
});

