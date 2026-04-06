// apps/backend-control-panel/src/index.ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { timeout } from "hono/timeout";
import { bodyLimit } from "hono/body-limit";
import { loadEnvironmentConfig, type EnvironmentConfig } from './env';
import { buildInternalDatabaseConnection } from './features-internal/internal.db';
import { buildTargetDatabaseConnection } from './features-target/target.db';
import { findTargetSystemById } from './features-internal/feature-target-registry/target-registry.repository';

// Fitur-fitur
import { createFeaturePanelAuth } from './features-internal/feature-auth/auth.block';
import { createFeatureAdminUsers } from './features-internal/feature-admin-users/block';
import { createFeatureSettings } from './features-internal/feature-settings/settings.block';
import { createFeatureTargetRegistry } from './features-internal/feature-target-registry/target-registry.block';
import { setupDynamicRoutesRouter } from './features-target/feature-dynamic-routes/router';
import { createFeatureTargetDatabaseSchema } from './features-target/feature-target-database-schema/block';
import { setupClientApiKeysRouter } from './features-target/feature-client-api-keys/router';
import { setupTargetCorsRouter } from './features-target/feature-target-cors/router';
import { createFeatureRbacRoles } from './features-target/feature-rbac-roles/block';
import { createFeatureRbacPermissions } from './features-target/feature-rbac-permissions/block';
import { createFeatureTargetAppUsers } from './features-target/feature-target-app-users/block';
import { createFeatureMonitorAnalytics } from './features-target/feature-monitor-analytics/block';
import { createFeatureMonitorDatabase } from './features-target/feature-monitor-database/block';

const apiPrefix = "/api";

/**
 * FACTORY JALUR DEPLOY: Membangun seluruh app hanya saat dibutuhkan (Lazy)
 * Ini mencegah error "INTERNAL DB URL MISSING" saat build-time/validation
 */
async function buildAppInstance(env: EnvironmentConfig) {
    const instance = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

    // Global error handler
    instance.onError((err, ctx) => {
        console.error("[HONO APP ERROR]", err);
        return ctx.json({ status: 'error', message: err.message || 'Internal Server Error' }, 500);
    });

    // Middlewares dasar
    instance.use("*", logger());
    instance.use("*", cors({
        origin: '*',
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowHeaders: ["Content-Type", "Authorization", "x-api-key", "x-target-id"],
        credentials: true,
    }));

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
                if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) throw new Error("INTERNAL DB URL MISSING");
                const internalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
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

    // --- REGISTER ROUTES ---
    instance.route('/api', createFeaturePanelAuth(env));
    instance.route(`${apiPrefix}/users`, createFeatureAdminUsers(env));
    instance.route(`${apiPrefix}/settings`, createFeatureSettings(env));
    instance.route(`${apiPrefix}/target-systems`, createFeatureTargetRegistry(env));

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

    return instance;
}

// --- JALUR RUNTIME (Lokal & Worker) ---
let cachedApp: any = null;
const rootApp = new Hono();

rootApp.all('*', async (c) => {
    try {
        // 1. Ambil env (dari .env lokal atau Cloudflare Bindings)
        const env = loadEnvironmentConfig(c.env);

        /**
         * FORCE FALLBACK JIKA KOSONG (Shield Lokal)
         * Ini memastikan saat TSX macet me-load env.ts terbaru, aplikasi tetap hidup.
         */
        if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL || env.DATABASE_URL_INTERNAL_CONTROL_PANEL === '') {
            (env as any).DATABASE_URL_INTERNAL_CONTROL_PANEL = 'mysql://4JnU6pSVxwRM5LU.root:nde9tTv5hnlcYT6n@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test';
        }

        // 2. Inisialisasi app hanya sekali
        if (!cachedApp) {
            console.log("[ROOT] Initializing App Instance (Lazy Build with Shield)...");
            cachedApp = await buildAppInstance(env);
        }

        // 3. SMART SWITCH: Delegasi request sesuai platform
        const isNode = typeof process !== 'undefined' && !!process.env;
        if (isNode) {
            // Jalur Node.js (Lokal): Gunakan request murni
            return cachedApp.request(c.req.raw, undefined, c.env);
        } else {
            // Jalur Worker: Gunakan fetch (butuh executionCtx)
            return cachedApp.fetch(c.req.raw, c.env, (c as any).executionCtx);
        }
    } catch (err: any) {
        console.error("[ROOT-ERROR]", err);
        return c.text(`Initialization Error: ${err.message}`, 500);
    }
});

export default rootApp;
