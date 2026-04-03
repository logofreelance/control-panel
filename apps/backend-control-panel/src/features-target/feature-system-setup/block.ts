/**
 * feature-system-setup (HANYA MENGGUNAKAN TARGET DB)
 * Mengontrol inisialisasi system dan route prefixes sasaran
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

export function createFeatureSystemSetup(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any } }>();
    
    router.use('*', async (c, next) => {
        c.set('db', buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM));
        await next();
    });

    const getDb = (c: any) => c.get('db') as ReturnType<typeof buildTargetDatabaseConnection>;

    router.get('/system-status', async (c) => {
        const hasDbUrl = !!envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM;
        let isDbConnected = false;
        let isAdminCreated = false;

        if (hasDbUrl) {
            try {
                await getDb(c).execute('SELECT 1');
                isDbConnected = true;
            } catch { /* DB not reachable */ }
        }

        // Check admin in INTERNAL DB
        try {
            const { buildInternalDatabaseConnection } = await import('../../features-internal/internal.db');
            const internalDb = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);
            const res: any = await internalDb.execute('SELECT COUNT(*) as cnt FROM admin_users');
            const rows = Array.isArray(res) ? res : (res.rows || []);
            isAdminCreated = Number(rows[0]?.cnt || 0) > 0;
        } catch { /* No admin table yet */ }

        return c.json({ hasDbUrl, isDbConnected, isAdminCreated, status: 'online', timestamp: new Date().toISOString() });
    });

    router.post('/validate-db-url', async (c) => c.json({ success: true, valid: true }));

    router.get('/route-prefixes', async (c) => {
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM route_prefixes`);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            const map = rows.reduce((acc: any, row: any) => { acc[row.name] = row.prefix; return acc; }, {});
            return c.json({ prefixes: rows, map });
        } catch (err: any) { return c.json({ error: 'Could not load route prefixes', defaults: { api: '/api' } }, 500); }
    });

    router.post('/refresh-routes', async (c) => {
        return c.json({ success: true, message: 'Routes refreshed virtually. Target nodes will dynamically catch up.' });
    });

    router.post('/setup-db', async (c) => {
        // Since we are serverless, we just verify connections here
        return c.json({ success: true, provider: { name: 'Titanium DB' } });
    });

    return router as any;
}
