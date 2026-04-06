// apps/backend-control-panel/src/index.ts
// Control Panel Backend API Entry Point (SaaS REFACTOR - DYNAMIC TARGETS)

import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { timeout } from "hono/timeout";
import { bodyLimit } from "hono/body-limit";
import { loadEnvironmentConfig } from './env';
import { buildInternalDatabaseConnection } from './features-internal/internal.db';
import { buildTargetDatabaseConnection } from './features-target/target.db';
import { findTargetSystemById } from './features-internal/feature-target-registry/target-registry.repository';

const APP_LABELS = {
    STATUS: { OK: 'ok', ERROR: 'error', ONLINE: 'online', DEGRADED: 'degraded' },
    ERRORS: {
        INTERNAL_SERVER_ERROR: 'Internal Server Error',
        REQUEST_BODY_TOO_LARGE: 'Request body too large',
    },
    DEFAULTS: { CORS_ORIGIN: '*' },
    MODULES: { SYSTEM: { SERVICE_NAME: 'control-panel-backend', LAYER: 'control-panel' } }
};

const SECURITY_LIMITS = {
    REQUEST_TIMEOUT_MS: 30000,
    MAX_BODY_SIZE: 1024 * 1024, // 1MB
};

let appInstance: Hono<{ Variables: { targetDb: any, targetId: string } }> | null = null;
const app = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

app.all('*', async (c) => {
    if (!appInstance) {
        const instance = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

        // 1. Initial configuration inside the wrapper for deployment safety
        const envConfig = loadEnvironmentConfig(c.env as any);

        // Global error handler
        instance.onError((err, ctx) => {
            console.error("[HONO APP ERROR]", err);
            return ctx.json({ status: APP_LABELS.STATUS.ERROR, message: err.message || APP_LABELS.ERRORS.INTERNAL_SERVER_ERROR }, 500);
        });

        // Middlewares
        instance.use("*", timeout(SECURITY_LIMITS.REQUEST_TIMEOUT_MS));
        instance.use("*", bodyLimit({
            maxSize: SECURITY_LIMITS.MAX_BODY_SIZE,
            onError: ctx => ctx.json({ status: APP_LABELS.STATUS.ERROR, code: 413, message: APP_LABELS.ERRORS.REQUEST_BODY_TOO_LARGE }, 413),
        }));
        instance.use("*", logger());
        instance.use("*", cors({
            origin: '*',
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            allowHeaders: ["Content-Type", "Authorization", "x-api-key", "x-target-id"],
            credentials: true,
        }));

        const apiPrefix = "/api";

        // --- SAAS TARGET MIDDLEWARE ---
        instance.use(`${apiPrefix}/*`, async (ctx, next) => {
            const targetId = ctx.req.header('x-target-id');
            const isTargetFeature = [
                '/api/monitor-database', '/api/database-schema', '/api/route-builder', 
                '/api/api-keys', '/api/cors', '/api/roles', '/api/permissions', 
                '/api/app-users', '/api/monitor-analytics'
            ].some(path => ctx.req.path.startsWith(path));

            if (isTargetFeature && targetId) {
                try {
                    const internalDb = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);
                    const target = await findTargetSystemById(internalDb, targetId);
                    
                    if (!target) {
                        return ctx.json({ status: 'error', message: 'Target system not found' }, 404);
                    }

                    const targetDb = buildTargetDatabaseConnection(target.database_url);
                    ctx.set('targetDb', targetDb);
                    ctx.set('targetId', targetId);
                } catch (err: any) {
                    console.error("[TARGET-MIDDLEWARE-ERROR]", err);
                    return ctx.json({ status: 'error', message: 'Failed to connect to target database' }, 500);
                }
            }
            await next();
        });

        // --- ROUTES ---
        const { createFeaturePanelAuth } = await import('./features-internal/feature-auth/auth.block');
        const { createFeatureAdminUsers } = await import('./features-internal/feature-admin-users/block');
        const { createFeatureSettings } = await import('./features-internal/feature-settings/settings.block');
        const { createFeatureTargetRegistry } = await import('./features-internal/feature-target-registry/target-registry.block');

        instance.route('/api', createFeaturePanelAuth(envConfig));
        instance.route(`${apiPrefix}/users`, createFeatureAdminUsers(envConfig));
        instance.route(`${apiPrefix}/settings`, createFeatureSettings(envConfig));
        instance.route(`${apiPrefix}/target-systems`, createFeatureTargetRegistry(envConfig));

        // --- TARGET FEATURES ---
        const { setupDynamicRoutesRouter } = await import('./features-target/feature-dynamic-routes/router');
        const { createFeatureTargetDatabaseSchema } = await import('./features-target/feature-target-database-schema/block');
        const { setupClientApiKeysRouter } = await import('./features-target/feature-client-api-keys/router');
        const { setupTargetCorsRouter } = await import('./features-target/feature-target-cors/router');
        const { createFeatureRbacRoles } = await import('./features-target/feature-rbac-roles/block');
        const { createFeatureRbacPermissions } = await import('./features-target/feature-rbac-permissions/block');
        const { createFeatureTargetAppUsers } = await import('./features-target/feature-target-app-users/block');
        const { createFeatureMonitorAnalytics } = await import('./features-target/feature-monitor-analytics/block');
        const { createFeatureMonitorDatabase } = await import('./features-target/feature-monitor-database/block');

        instance.route(`${apiPrefix}/route-builder`, setupDynamicRoutesRouter());
        instance.route(`${apiPrefix}/database-schema`, createFeatureTargetDatabaseSchema());
        instance.route(`${apiPrefix}/api-keys`, setupClientApiKeysRouter());
        instance.route(`${apiPrefix}/cors`, setupTargetCorsRouter());
        instance.route(`${apiPrefix}/roles`, createFeatureRbacRoles());
        instance.route(`${apiPrefix}/permissions`, createFeatureRbacPermissions());
        instance.route(`${apiPrefix}/app-users`, createFeatureTargetAppUsers());
        instance.route(`${apiPrefix}/monitor-analytics`, createFeatureMonitorAnalytics());
        instance.route(`${apiPrefix}/monitor-database`, createFeatureMonitorDatabase());

        instance.get("/health", ctx => ctx.json({ status: 'ok', service: 'backend-control-panel' }));
        
        appInstance = instance;
    }

    // Delegation must be careful about ExecutionContext in Node.js
    return appInstance.fetch(c.req.raw, c.env, (c as any).executionCtx);
});
export default app;
