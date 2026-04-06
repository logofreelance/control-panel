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
        appInstance = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

        // Global error handler
        appInstance.onError((err, ctx) => {
            console.error("[HONO APP ERROR]", err);
            return ctx.json({ status: APP_LABELS.STATUS.ERROR, message: err.message || APP_LABELS.ERRORS.INTERNAL_SERVER_ERROR }, 500);
        });

        // Middlewares
        appInstance.use("*", timeout(SECURITY_LIMITS.REQUEST_TIMEOUT_MS));
        appInstance.use("*", bodyLimit({
            maxSize: SECURITY_LIMITS.MAX_BODY_SIZE,
            onError: ctx => ctx.json({ status: APP_LABELS.STATUS.ERROR, code: 413, message: APP_LABELS.ERRORS.REQUEST_BODY_TOO_LARGE }, 413),
        }));
        appInstance.use("*", logger());
        appInstance.use("*", cors({
            origin: '*',
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            allowHeaders: ["Content-Type", "Authorization", "x-api-key", "x-target-id"],
            credentials: true,
        }));

        const envConfig = loadEnvironmentConfig(c.env as any);
        const apiPrefix = "/api";

        // --- SAAS TARGET MIDDLEWARE ---
        appInstance.use(`${apiPrefix}/*`, async (ctx, next) => {
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

        appInstance.route('/api', createFeaturePanelAuth(envConfig));
        appInstance.route(`${apiPrefix}/users`, createFeatureAdminUsers(envConfig));
        appInstance.route(`${apiPrefix}/settings`, createFeatureSettings(envConfig));
        appInstance.route(`${apiPrefix}/target-systems`, createFeatureTargetRegistry(envConfig));

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
        appInstance.route(`${apiPrefix}/route-builder`, setupDynamicRoutesRouter());
        appInstance.route(`${apiPrefix}/database-schema`, createFeatureTargetDatabaseSchema());
        appInstance.route(`${apiPrefix}/api-keys`, setupClientApiKeysRouter());
        appInstance.route(`${apiPrefix}/cors`, setupTargetCorsRouter());
        appInstance.route(`${apiPrefix}/roles`, createFeatureRbacRoles());
        appInstance.route(`${apiPrefix}/permissions`, createFeatureRbacPermissions());
        appInstance.route(`${apiPrefix}/app-users`, createFeatureTargetAppUsers());
        appInstance.route(`${apiPrefix}/monitor-analytics`, createFeatureMonitorAnalytics());
        appInstance.route(`${apiPrefix}/monitor-database`, createFeatureMonitorDatabase());

        appInstance.get("/health", ctx => ctx.json({ status: 'ok', service: 'backend-control-panel' }));
    }

    return appInstance.fetch(c.req.raw, c.env, c.executionCtx);
});

export default app;
