// apps/backend-control-panel/src/index.ts
// Control Panel Backend API Entry Point (FLAT ARCHITECTURE - AI FRIENDLY)

import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { timeout } from "hono/timeout";
import { bodyLimit } from "hono/body-limit";
import { loadEnvironmentConfig } from './env';

// ============================================
// CONSTANTS (Inline - No External Package)
// ============================================
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

const app = new Hono();

// Global error handler
app.onError((err, c) => {
    console.error("[HONO APP ERROR]", err);
    return c.json({ status: APP_LABELS.STATUS.ERROR, message: APP_LABELS.ERRORS.INTERNAL_SERVER_ERROR }, 500);
});

// ============================================
// GLOBAL SECURITY MIDDLEWARE
// ============================================

// 1. Request timeout (30 seconds default)
app.use("*", timeout(SECURITY_LIMITS.REQUEST_TIMEOUT_MS));

// 2. Body size limit (1MB default)
app.use("*", bodyLimit({
    maxSize: SECURITY_LIMITS.MAX_BODY_SIZE,
    onError: c => c.json({ status: APP_LABELS.STATUS.ERROR, code: 413, message: APP_LABELS.ERRORS.REQUEST_BODY_TOO_LARGE }, 413),
}));

// 3. Request ID for tracing
app.use("*", async (c, next) => {
    const requestId = crypto.randomUUID();
    (c as any).requestId = requestId;
    c.header("X-Request-Id", requestId);
    await next();
});

// 4. Global Logger
app.use("*", logger());

// 5. CORS Configuration (Specific for Dashboard)
app.use("*", async (c, next) => {
    const corsMiddleware = cors({
        origin: origin => origin || APP_LABELS.DEFAULTS.CORS_ORIGIN,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowHeaders: ["Content-Type", "Authorization", "x-api-key", "x-csrf-token", "x-target-id"],
        exposeHeaders: ["Content-Length", "x-csrf-token"],
        credentials: true,
    });
    return corsMiddleware(c, next);
});

// ============================================
// API PREFIX
// ============================================
const apiPrefix = "/api";

app.get(`${apiPrefix}/csrf-token`, (c) => c.json({ success: true, token: crypto.randomUUID() }));

// ============================================
// DUAL-DATABASE FEATURE MOUNTING (AI-FRIENDLY)
// ============================================
const envConfig = loadEnvironmentConfig();

// --- INTERNAL DATABASE FEATURES (Control Panel's own DB) ---
import { createFeaturePanelAuth } from './features-internal/feature-auth/auth.block';
import { createFeatureAdminUsers } from './features-internal/feature-admin-users/block';
import { createFeatureSettings } from './features-internal/feature-settings/settings.block';
import { createFeatureTargetRegistry } from './features-internal/feature-target-registry/target-registry.block';

app.route('/api', createFeaturePanelAuth(envConfig));
app.route(`${apiPrefix}/users`, createFeatureAdminUsers(envConfig));
app.route(`${apiPrefix}/settings`, createFeatureSettings(envConfig));
app.route(`${apiPrefix}/target-systems`, createFeatureTargetRegistry(envConfig));

// --- TARGET DATABASE FEATURES (Backend System's DB) ---
import { setupDynamicRoutesRouter } from './features-target/feature-dynamic-routes/router';
import { createFeatureTargetDatabaseSchema } from './features-target/feature-target-database-schema/block';
import { setupClientApiKeysRouter } from './features-target/feature-client-api-keys/router';
import { setupTargetCorsRouter } from './features-target/feature-target-cors/router';
import { createFeatureRbacRoles } from './features-target/feature-rbac-roles/block';
import { createFeatureRbacPermissions } from './features-target/feature-rbac-permissions/block';
import { createFeatureMonitorAnalytics } from './features-target/feature-monitor-analytics/block';
import { createFeatureTargetAppUsers } from './features-target/feature-target-app-users/block';
import { createFeatureSystemSetup } from './features-target/feature-system-setup/block';

import { createFeatureMonitorDatabase } from './features-target/feature-monitor-database/block';

app.route(`${apiPrefix}/route-builder`, setupDynamicRoutesRouter(envConfig));
app.route(`${apiPrefix}/database-schema`, createFeatureTargetDatabaseSchema(envConfig));
app.route(`${apiPrefix}/api-keys`, setupClientApiKeysRouter(envConfig));
app.route(`${apiPrefix}/cors`, setupTargetCorsRouter(envConfig));
app.route(`${apiPrefix}/roles`, createFeatureRbacRoles(envConfig));
app.route(`${apiPrefix}/permissions`, createFeatureRbacPermissions(envConfig));
app.route(`${apiPrefix}/app-users`, createFeatureTargetAppUsers(envConfig));
app.route(`${apiPrefix}/monitor-analytics`, createFeatureMonitorAnalytics(envConfig));
app.route(`${apiPrefix}/monitor-database`, createFeatureMonitorDatabase(envConfig));
app.route('/api', createFeatureSystemSetup(envConfig));

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", c => c.json({
    status: APP_LABELS.STATUS.OK,
    service: APP_LABELS.MODULES.SYSTEM.SERVICE_NAME,
}));

export default app;
