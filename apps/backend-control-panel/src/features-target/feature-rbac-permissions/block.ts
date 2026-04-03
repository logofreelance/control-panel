/**
 * feature-rbac-permissions (HANYA MENGGUNAKAN TARGET DB)
 * Mengelola tingkatan Permissions tiap Role pada target backend
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

export function createFeatureRbacPermissions(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any } }>();
    
    router.use('*', async (c, next) => {
        c.set('db', buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM));
        await next();
    });

    const getDb = (c: any) => c.get('db') as ReturnType<typeof buildTargetDatabaseConnection>;

    router.get('/', async (c) => {
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM permissions ORDER BY created_at DESC`);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            return c.json({ status: 'success', data: rows });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.post('/', async (c) => {
        try {
            const { role_id, resource, action, conditions } = await c.req.json();
            const newId = crypto.randomUUID();
            await getDb(c).execute(
                `INSERT INTO permissions (id, role_id, resource, action, conditions) VALUES (?, ?, ?, ?, ?)`,
                [newId, role_id, resource || '*', action || '*', conditions || null]
            );
            return c.json({ status: 'success', data: { id: newId, resource } });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.delete('/:id', async (c) => {
        try {
            const id = c.req.param('id');
            await getDb(c).execute(`DELETE FROM permissions WHERE id = ?`, [id]);
            return c.json({ status: 'success', message: 'Deleted' });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    return router as any;
}
