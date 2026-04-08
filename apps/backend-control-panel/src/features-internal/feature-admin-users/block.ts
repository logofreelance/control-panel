/**
 * feature-admin-users (HANYA MENGGUNAKAN INTERNAL DB)
 * Mengontrol CRUD staf/admin untuk Control Panel
 */
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { buildInternalDatabaseConnection } from '../internal.db';
import type { EnvironmentConfig } from '../../env';

function respondError(c: HonoContext, message: string, status: number) {
    return c.json({ success: false, error: { code: 'ERROR', message } }, status);
}

type HonoContext = Hono<{ Variables: { user: any, session: any } }>;

export function createFeatureAdminUsers(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { user: any, session: any } }>();
    const db = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);

    // Get all admin users
    router.get('/', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
        }
        
        try {
            const res: any = await db.execute(`SELECT id, username, role, created_at, updated_at FROM admin_users ORDER BY created_at DESC`);
            const rows = Array.isArray(res) ? res : res.rows;
            return c.json({ status: 'success', data: rows });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // Create new admin
    router.post('/', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
        }
        
        try {
            const { username, password, role = 'admin' } = await c.req.json();
            if (!username || !password) return c.json({ status: 'error', message: 'Username & Password required' }, 400);

            const hash = await bcrypt.hash(password, 10);
            const newId = crypto.randomUUID();

            await db.execute(
                `INSERT INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
                [newId, username, hash, role]
            );

            return c.json({ status: 'success', data: { id: newId, username, role } });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // Delete admin
    router.delete('/:id', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
        }
        
        try {
            const id = c.req.param('id');
            await db.execute(`DELETE FROM admin_users WHERE id = ?`, [id]);
            return c.json({ status: 'success', message: 'Admin deleted' });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    return router as any;
}
