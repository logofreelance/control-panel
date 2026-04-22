// Apps/backend-control-panel/src/index.ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { timeout } from 'hono/timeout';
import { bodyLimit } from 'hono/body-limit';
import { loadEnvironmentConfig, type EnvironmentConfig } from './env';
import { buildInternalDatabaseConnection } from './features-internal/internal.db';
import { buildTargetDatabaseConnection } from './features-target/target.db';
// Fitur-fitur
import { createFeaturePanelAuth } from './features-internal/feature-auth/router';
import { createFeatureAdminUsers } from './features-internal/feature-admin-users/router';
import { createFeatureSettings } from './features-internal/feature-settings/router';
import { createFeatureTargetRegistry } from './features-internal/feature-target-registry/router';
import { setupDynamicRoutesRouter } from './features-target/feature-dynamic-routes/router';
import { createFeatureTargetDatabaseSchema } from './features-target/feature-target-database-schema/router';
import { setupClientApiKeysRouter } from './features-target/feature-client-api-keys/router';
import { setupTargetCorsRouter } from './features-target/feature-target-cors/router';
import { createFeatureRbacRoles } from './features-target/feature-rbac-roles/block';
import { createFeatureRbacPermissions } from './features-target/feature-rbac-permissions/block';
import { createFeatureTargetAppUsers } from './features-target/feature-target-app-users/block';
import { createFeatureMonitorAnalytics } from './features-target/feature-monitor-analytics/block';
import { createFeatureTargetMonitorDatabase } from './features-target/feature-monitor-database/router';
import { setupIntegrationRouter } from './features-target/feature-integration/router';

const apiPrefix = '/api';

// CONTEXT CACHE: Mencegah Socket Exhaustion (EACCES) pada Windows
let cachedInternalDb: any = null;
const cachedTargetDbs = new Map<string, any>();

async function buildAppInstance(env: EnvironmentConfig) {
  const instance = new Hono<{ Variables: { targetDb: any; targetId: string; user: any; session: any } }>();

  // Global error handler
  instance.onError((err, ctx) => {
    console.error('[HONO APP ERROR]', err);
    return ctx.json({ status: 'error', message: err.message || 'Internal Server Error' }, 500);
  });

  // Middlewares dasar
  instance.use('*', logger());
  instance.use('*', timeout(25000)); // 25 detik max sebelum timeout
  instance.use(
    '*',
    cors({
      origin: (origin) => origin, // Izinkan origin yang memanggil
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-target-id'],
      credentials: true,
    }),
  );

  // (AUTH MIDDLEWARE DIHAPUS DARI SINI: kini terisolasi di masing-masing Route Island)

  // --- SAAS TARGET MIDDLEWARE ---
  instance.use(`${apiPrefix}/*`, async (ctx, next) => {
    const targetId = ctx.req.header('x-target-id');
    const path = ctx.req.path;
    const isTargetFeature = [
      '/api/monitor-database',
      '/api/database-schema',
      '/api/route-builder',
      '/api/api-keys',
      '/api/cors',
      '/api/roles',
      '/api/permissions',
      '/api/app-users',
      '/api/monitor-analytics',
      '/api/integration',
    ].some((p) => path.startsWith(p));

    if (isTargetFeature && targetId) {
      try {
        if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) throw new Error('INTERNAL DB URL MISSING');
        
        // 1. REUSE INTERNAL DB CONNECTION
        if (!cachedInternalDb) {
           cachedInternalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
        }
        const internalDb = cachedInternalDb;
        
        // 2. REUSE TARGET DB CONNECTION IF CACHED
        if (cachedTargetDbs.has(targetId)) {
          ctx.set('targetDb', cachedTargetDbs.get(targetId));
          ctx.set('targetId', targetId);
        } else {
          const res: any = await internalDb.execute('SELECT database_url FROM target_systems WHERE id = ? LIMIT 1', [targetId]);
          const rows = Array.isArray(res) ? res : (res.rows || []);
          const target = rows.length > 0 ? rows[0] : null;
          if (!target) return ctx.json({ status: 'error', message: 'Target system not found' }, 404);

          const targetDb = buildTargetDatabaseConnection(target.database_url);
          cachedTargetDbs.set(targetId, targetDb);
          ctx.set('targetDb', targetDb);
          ctx.set('targetId', targetId);
        }
      } catch (err: any) {
        console.error('[TARGET-MIDDLEWARE-ERROR]', err);
        return ctx.json({ status: 'error', message: 'Failed to connect to target database' }, 500);
      }
    }
    await next();
  });

  // --- REGISTER ROUTES (SPECIFIC FEATURES FIRST) ---
  // Target System Features
  instance.route(`${apiPrefix}/monitor-database`, createFeatureTargetMonitorDatabase(env));
  instance.route(`${apiPrefix}/monitor-analytics`, createFeatureMonitorAnalytics());
  instance.route(`${apiPrefix}/database-schema`, createFeatureTargetDatabaseSchema(env));
  instance.route(`${apiPrefix}/route-builder`, setupDynamicRoutesRouter());
  instance.route(`${apiPrefix}/integration`, setupIntegrationRouter());
  instance.route(`${apiPrefix}/app-users`, createFeatureTargetAppUsers());
  instance.route(`${apiPrefix}/permissions`, createFeatureRbacPermissions());
  instance.route(`${apiPrefix}/roles`, createFeatureRbacRoles());
  instance.route(`${apiPrefix}/api-keys`, setupClientApiKeysRouter());
  instance.route(`${apiPrefix}/cors`, setupTargetCorsRouter());

  // Internal System Features
  instance.route(`${apiPrefix}/users`, createFeatureAdminUsers(env));
  instance.route(`${apiPrefix}/settings`, createFeatureSettings(env));
  instance.route(`${apiPrefix}/target-systems`, createFeatureTargetRegistry(env));

    // System Status
    instance.get(`${apiPrefix}/system-status`, async (ctx) => {
      const hasDbUrl = !!env.DATABASE_URL_INTERNAL_CONTROL_PANEL;
      let isDbConnected = false;
      let isAdminCreated = false;

      if (hasDbUrl) {
        try {
          if (!cachedInternalDb) {
            cachedInternalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
          }
          const db = cachedInternalDb;
          await db.execute('SELECT 1'); // Test connection
          isDbConnected = true;

          const res: any = await db.execute('SELECT id FROM admin_users LIMIT 1');
          const rows = Array.isArray(res) ? res : res.rows || [];
          isAdminCreated = rows.length > 0;
        } catch (err) {
          console.error('[SYSTEM-STATUS] DB Check Failed:', err);
        }
      }

      return ctx.json({
        status: 'ok',
        hasDbUrl,
        isDbConnected,
        isAdminCreated,
      });
    });

  // --- LEAST SPECIFIC / BROAD PREFIX (RUN LAST) ---
  // Auth App registered last to avoid shadowing other /api/* routes
  instance.route('/api', createFeaturePanelAuth(env));

  instance.get('/health', (ctx) => ctx.json({ status: 'ok', service: 'backend-control-panel' }));

  return instance;
}

// --- JALUR RUNTIME (Lokal & Worker) ---
let cachedApp: any = null;
const rootApp = new Hono();

rootApp.all('*', async (c) => {
  try {
    // 1. Ambil env (dari .env lokal atau Cloudflare Bindings)
    const env = loadEnvironmentConfig(c.env);

    // 2. Inisialisasi app hanya sekali
    if (!cachedApp) {
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
    console.error('[ROOT-ERROR]', err);
    return c.text(`Initialization Error: ${err.message}`, 500);
  }
});

export default rootApp;
