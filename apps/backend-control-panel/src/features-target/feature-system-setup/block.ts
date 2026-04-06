/**
 * feature-system-setup (SaaS REFACTOR)
 */
import { Hono } from 'hono';
import { buildInternalDatabaseConnection } from '../../features-internal/internal.db';

export function createFeatureSystemSetup(envConfig: any) {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();
    
    const getDb = (c: any) => c.get('targetDb');

    router.get('/system-status', async (c) => {
        let isDbConnected = false;
        let isAdminCreated = false;

        const db = getDb(c);
        if (db) {
            try {
                await db.execute('SELECT 1');
                isDbConnected = true;
            } catch { /* DB not reachable */ }
        }

        try {
            const internalDb = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);
            const res: any = await internalDb.execute('SELECT COUNT(*) as cnt FROM admin_users');
            const rows = Array.isArray(res) ? res : (res.rows || []);
            isAdminCreated = Number(rows[0]?.cnt || 0) > 0;
        } catch { /* No admin table yet */ }

        return c.json({ isDbConnected, isAdminCreated, status: 'online', timestamp: new Date().toISOString() });
    });

    router.get('/route-prefixes', async (c) => {
        if (!getDb(c)) return c.json({ error: 'No target database' }, 400);
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM route_prefixes`);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            const map = rows.reduce((acc: any, row: any) => { acc[row.name] = row.prefix; return acc; }, {});
            return c.json({ prefixes: rows, map });
        } catch (err: any) { return c.json({ error: 'Could not load route prefixes' }, 500); }
    });

    return router as any;
}
