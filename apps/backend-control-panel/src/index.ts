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

// --- APP LABELS & LIMITS ---
const APP_LABELS = {
    STATUS: { OK: 'ok', ERROR: 'error' },
    ERRORS: { INTERNAL_SERVER_ERROR: 'Internal Server Error', REQUEST_BODY_TOO_LARGE: 'Request body too large' }
};
const SECURITY_LIMITS = { REQUEST_TIMEOUT_MS: 30000, MAX_BODY_SIZE: 1024 * 1024 };

const app = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

// 1. Inisialisasi Environment (Otomatis & Robust)
const envConfig = loadEnvironmentConfig();

// Global error handler
app.onError((err, ctx) => {
    console.error("[HONO APP ERROR]", err);
    return ctx.json({ status: APP_LABELS.STATUS.ERROR, message: err.message || APP_LABELS.ERRORS.INTERNAL_SERVER_ERROR }, 500);
});

// Middlewares
app.use("*", timeout(SECURITY_LIMITS.REQUEST_TIMEOUT_MS));
app.use("*", bodyLimit({
    maxSize: SECURITY_LIMITS.MAX_BODY_SIZE,
    onError: ctx => ctx.json({ status: APP_LABELS.STATUS.ERROR, code: 413, message: APP_LABELS.ERRORS.REQUEST_BODY_TOO_LARGE }, 413),
}));
app.use("*", logger());
app.use("*", cors({
    origin: '*',
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "x-api-key", "x-target-id"],
    credentials: true,
}));

const apiPrefix = "/api";

// --- SAAS TARGET MIDDLEWARE ---
app.use(`${apiPrefix}/*`, async (ctx, next) => {
    const targetId = ctx.req.header('x-target-id');
    const isTargetFeature = [
        '/api/monitor-database', '/api/database-schema', '/api/route-builder', 
        '/api/api-keys', '/api/cors', '/api/roles', '/api/permissions', 
        '/api/app-users', '/api/monitor-analytics'
    ].some(path => ctx.req.path.startsWith(path));

    if (isTargetFeature && targetId) {
        try {
            if (!envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL) throw new Error("INTERNAL DB URL MISSING");
            
            const internalDb = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);
            const target = await findTargetSystemById(internalDb, targetId);
            if (!target) return ctx.json({ status: 'error', message: 'Target system not found' }, 404);

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
import { createFeaturePanelAuth } from './features-internal/feature-auth/auth.block';
import { createFeatureAdminUsers } from './features-internal/feature-admin-users/block';
import { createFeatureSettings } from './features-internal/feature-settings/settings.block';
import { createFeatureTargetRegistry } from './features-internal/feature-target-registry/target-registry.block';

app.route('/api', createFeaturePanelAuth(envConfig));
app.route(`${apiPrefix}/users`, createFeatureAdminUsers(envConfig));
app.route(`${apiPrefix}/settings`, createFeatureSettings(envConfig));
app.route(`${apiPrefix}/target-systems`, createFeatureTargetRegistry(envConfig));

// --- TARGET FEATURES ---
import { setupDynamicRoutesRouter } from './features-target/feature-dynamic-routes/router';
import { createFeatureTargetDatabaseSchema } from './features-target/feature-target-database-schema/block';
import { setupClientApiKeysRouter } from './features-target/feature-client-api-keys/router';
import { setupTargetCorsRouter } from './features-target/feature-target-cors/router';
import { createFeatureRbacRoles } from './features-target/feature-rbac-roles/block';
import { createFeatureRbacPermissions } from './features-target/feature-rbac-permissions/block';
import { createFeatureTargetAppUsers } from './features-target/feature-target-app-users/block';
import { createFeatureMonitorAnalytics } from './features-target/feature-monitor-analytics/block';
import { createFeatureMonitorDatabase } from './features-target/feature-monitor-database/block';

app.route(`${apiPrefix}/route-builder`, setupDynamicRoutesRouter());
app.route(`${apiPrefix}/database-schema`, createFeatureTargetDatabaseSchema());
app.route(`${apiPrefix}/api-keys`, setupClientApiKeysRouter());
app.route(`${apiPrefix}/cors`, setupTargetCorsRouter());
app.route(`${apiPrefix}/roles`, createFeatureRbacRoles());
app.route(`${apiPrefix}/permissions`, createFeatureRbacPermissions());
app.route(`${apiPrefix}/app-users`, createFeatureTargetAppUsers());
app.route(`${apiPrefix}/monitor-analytics`, createFeatureMonitorAnalytics());
app.route(`${apiPrefix}/monitor-database`, createFeatureMonitorDatabase());

app.get("/health", ctx => ctx.json({ status: 'ok', service: 'backend-control-panel' }));

export default app;
