/**
 * feature-rbac-permissions (SaaS REFACTOR)
 * Mengelola tingkatan Permissions tiap Role pada target backend
 */
import { Hono } from 'hono';

export function createFeatureRbacPermissions() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();
    
    const getDb = (c: any) => c.get('targetDb');

    // Middleware guard
    router.use('*', async (c, next) => {
        if (!getDb(c)) {
            return c.json({ status: 'error', message: 'Target database connection not established. Make sure x-target-id header is provided.' }, 400);
        }
        await next();
    });

    router.get('/', async (c) => {
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM permissions ORDER BY created_at DESC`);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            return c.json({ status: 'success', data: rows });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    router.post('/', async (c) => {
        try {
            const body = await c.req.json();
            const { role_id, resource, action, conditions } = body;
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
