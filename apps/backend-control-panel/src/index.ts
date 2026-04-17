// apps/backend-control-panel/src/index.ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { timeout } from 'hono/timeout';
import { bodyLimit } from 'hono/body-limit';
import { loadEnvironmentConfig, type EnvironmentConfig } from './env';
import { buildInternalDatabaseConnection } from './features-internal/internal.db';
import { buildTargetDatabaseConnection } from './features-target/target.db';
import { findTargetSystemById } from './features-internal/feature-target-registry/target-registry.repository';
import { buildAuthPanelLucia } from './features-internal/feature-auth/auth.lucia';

// Fitur-fitur
import { createFeaturePanelAuth } from './features-internal/feature-auth/auth.block';
import { createFeatureAdminUsers } from './features-internal/feature-admin-users/block';
import { createFeatureSettings } from './features-internal/feature-settings/settings.block';
import { createFeatureTargetRegistry } from './features-internal/feature-target-registry/target-registry.block';
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

/**
 * FACTORY JALUR DEPLOY: Membangun seluruh app hanya saat dibutuhkan (Lazy)
 * Ini mencegah error "INTERNAL DB URL MISSING" saat build-time/validation
 */
async function buildAppInstance(env: EnvironmentConfig) {
  const instance = new Hono<{ Variables: { targetDb: any; targetId: string } }>();

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

  // --- AUTH MIDDLEWARE (SESSION VALIDATION) ---
  instance.use(`${apiPrefix}/*`, async (ctx, next) => {
    // Skip session validation for public health check
    if (ctx.req.path === '/health') return next();

    try {
      if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) throw new Error('INTERNAL DB URL MISSING');
      const db = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
      const isProd = env.NODE_ENV === 'production';
      const lucia = buildAuthPanelLucia(db, isProd);

      const sessionId = lucia.readSessionCookie(ctx.req.header('Cookie') ?? "") 
                     ?? lucia.readBearerToken(ctx.req.header('Authorization') ?? "");
                     
      if (!sessionId) {
        ctx.set('user', null);
        ctx.set('session', null);
        return next();
      }

      const { session, user } = await lucia.validateSession(sessionId);
      if (session && session.fresh) {
        ctx.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), { append: true });
      }
      if (!session) {
        ctx.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
      }
      
      ctx.set('session', session);
      ctx.set('user', user);
    } catch (err) {
      console.error('[AUTH-MIDDLEWARE-ERROR]', err);
      ctx.set('session', null);
      ctx.set('user', null);
    }
    await next();
  });

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
        const internalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
        const target = await findTargetSystemById(internalDb, targetId);
        if (!target) return ctx.json({ status: 'error', message: 'Target system not found' }, 404);

        const targetDb = buildTargetDatabaseConnection(target.database_url);
        ctx.set('targetDb', targetDb);
        ctx.set('targetId', targetId);
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
        const db = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
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
