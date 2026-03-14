// apps/control-panel-system/src/index.ts
// Control Panel Backend API Entry Point

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { timeout } from 'hono/timeout';
import { bodyLimit } from 'hono/body-limit';
import { SECURITY_LIMITS, isDev } from '@cp/config';

// Import Modules Router
import { modulesRouter } from './modules';
import { createRequestLogger, csrfToken, csrfProtection, getCsrfToken } from '@cp/middleware';
import { DrizzleApiLogRepository } from './repositories/system-middleware/api-logs';
import { APP_LABELS } from './config/labels';

const app = new Hono();

// Global error handler
app.onError((err, c) => {
    console.error('[HONO APP ERROR]', err);
    return c.json({
        status: APP_LABELS.STATUS.ERROR,
        message: APP_LABELS.ERRORS.INTERNAL_SERVER_ERROR
    }, 500);
});

// ============================================
// GLOBAL SECURITY MIDDLEWARE
// ============================================

// 1. Request timeout (30 seconds default)
// 1. Request timeout (30 seconds default)
app.use('*', timeout(SECURITY_LIMITS.REQUEST_TIMEOUT_MS));

// 2. Body size limit (1MB default)
app.use('*', bodyLimit({
    maxSize: SECURITY_LIMITS.MAX_BODY_SIZE,
    onError: (c) => {
        return c.json({
            status: APP_LABELS.STATUS.ERROR,
            code: 413,
            message: APP_LABELS.ERRORS.REQUEST_BODY_TOO_LARGE
        }, 413);
    }
}));

// 3. Request ID for tracing
app.use('*', async (c, next) => {
    const requestId = crypto.randomUUID();
    (c as any).requestId = requestId;
    c.header('X-Request-Id', requestId);
    await next();
});

// 4. Global Logger
app.use('*', logger());

// 5. CORS Configuration (Specific for Dashboard)
app.use('*', async (c, next) => {
    const corsMiddleware = cors({
        origin: (origin) => {
            if (!origin) return APP_LABELS.DEFAULTS.CORS_ORIGIN; // Allow Dashboard or Server-to-Server
            // You might want to restrict this to specific dashboard URLs in production
            return origin;
        },
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-csrf-token'],
        exposeHeaders: ['Content-Length', 'x-csrf-token'],
        credentials: true,
    });

    return corsMiddleware(c, next);
});

/**
 * API LAYER (Control Panel Management)
 * Mounted at root for this specific service
 */
app.use('/*', csrfToken); // Set CSRF token cookie for all requests
app.use('/*', csrfProtection); // Protect state-changing operations
app.use('/*', createRequestLogger((c) => {
    // Factory for repository - uses per-request env
    const dbUrl = (c.env as any).DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL missing');
    return new DrizzleApiLogRepository(dbUrl);
})); // Log all requests

// Mount CSRF Token endpoint (Frontend needs this)
// app.get('/api/csrf-token', getCsrfToken);

// Mount all module routes under /api prefix
app.route('/api', modulesRouter);

// Health Check
app.get('/health', (c) => c.json({ status: APP_LABELS.STATUS.OK, service: APP_LABELS.MODULES.SYSTEM.SERVICE_NAME }));


export default app;
