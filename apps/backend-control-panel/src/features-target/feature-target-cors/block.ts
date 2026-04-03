/**
 * feature-target-cors (HANYA MENGGUNAKAN TARGET DB)
 * Mengelola domain CORS yang diizinkan untuk target system
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

export function createFeatureTargetCors(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any } }>();
    
    router.use('*', async (c, next) => {
        c.set('db', buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM));
        await next();
    });

    const getDb = (c: any) => c.get('db') as ReturnType<typeof buildTargetDatabaseConnection>;

    router.get('/', async (c) => {
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM target_cors_domains ORDER BY created_at DESC`);
            const rows = Array.isArray(res) ? res : res.rows;
            return c.json({ status: 'success', data: rows });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.post('/', async (c) => {
        try {
            const { domain_url, description } = await c.req.json();
            const newId = crypto.randomUUID();
            await getDb(c).execute(
                `INSERT INTO target_cors_domains (id, domain_url, description) VALUES (?, ?, ?)`,
                [newId, domain_url, description]
            );
            return c.json({ status: 'success', data: { id: newId, domain_url, description } });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.put('/:id/toggle', async (c) => {
        try {
            const id = c.req.param('id');
            const { isActive } = await c.req.json();
            await getDb(c).execute(`UPDATE target_cors_domains SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);
            return c.json({ status: 'success', message: 'Toggled' });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.delete('/:id', async (c) => {
        try {
            const id = c.req.param('id');
            await getDb(c).execute(`DELETE FROM target_cors_domains WHERE id = ?`, [id]);
            return c.json({ status: 'success', message: 'Deleted' });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    return router as any;
}
