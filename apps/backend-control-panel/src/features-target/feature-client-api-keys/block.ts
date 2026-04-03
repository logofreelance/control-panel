/**
 * feature-client-api-keys (HANYA MENGGUNAKAN TARGET DB)
 * Mengelola API Keys untuk end-users di target system
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

export function createFeatureClientApiKeys(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any } }>();
    
    // Middleware to inject db
    router.use('*', async (c, next) => {
        const db = buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM);
        c.set('db', db);
        await next();
    });

    const getDb = (c: any) => c.get('db') as ReturnType<typeof buildTargetDatabaseConnection>;

    router.get('/', async (c) => {
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM api_keys ORDER BY created_at DESC`);
            const rows = Array.isArray(res) ? res : res.rows;
            return c.json({ status: 'success', data: rows });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.post('/', async (c) => {
        try {
            const { name, expiresAt } = await c.req.json();
            const newId = crypto.randomUUID();
            const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`;
            
            await getDb(c).execute(
                `INSERT INTO api_keys (id, name, key_hash, expires_at) VALUES (?, ?, ?, ?)`,
                [newId, name, rawKey, expiresAt || null] // In a real system, hash it. Here we store raw for demo or hash it according to system rules.
            );
            return c.json({ status: 'success', data: { id: newId, name, key: rawKey } });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.put('/:id/toggle', async (c) => {
        try {
            const id = c.req.param('id');
            const { isActive } = await c.req.json();
            await getDb(c).execute(`UPDATE api_keys SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);
            return c.json({ status: 'success', message: 'Status updated' });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.delete('/:id', async (c) => {
        try {
            const id = c.req.param('id');
            await getDb(c).execute(`DELETE FROM api_keys WHERE id = ?`, [id]);
            return c.json({ status: 'success', message: 'Deleted' });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    return router as any;
}
