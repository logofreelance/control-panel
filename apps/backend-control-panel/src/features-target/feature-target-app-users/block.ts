/**
 * feature-target-app-users (TARGET DB ONLY)
 * Mengelola end-user pada target sistem yang dipilih.
 * Injeksi DB dilakukan secara dinamis melalui header x-target-id.
 */
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { injectTargetDatabase } from '../feature-dynamic-routes/middleware';
import type { EnvironmentConfig } from '../../env';

export function createFeatureTargetAppUsers(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any, targetId: string } }>();

    // 1. Dynamic Database Injection
    router.use('*', injectTargetDatabase(envConfig));

    const getDb = (c: any) => c.get('db');

    // List Users
    router.get('/', async (c) => {
        try {
            const page = Number(c.req.query('page')) || 1;
            const limit = Number(c.req.query('limit')) || 10;
            const search = c.req.query('search') || '';
            const status = c.req.query('status') || 'all';
            const role = c.req.query('role') || 'all';
            const sort = c.req.query('sort') === 'asc' ? 'ASC' : 'DESC';

            const offset = (page - 1) * limit;
            // Build WHERE clause
            const conditions: string[] = ['1=1']; // Base condition
            const params: any[] = [];

            if (search) {
                conditions.push('(u.username LIKE ? OR u.email LIKE ?)');
                params.push(`%${search}%`, `%${search}%`);
            }
            if (status && status !== 'all') {
                const isActive = status === 'active' ? 1 : 0;
                conditions.push('u.is_active = ?');
                params.push(isActive);
            }
            if (role && role !== 'all') {
                conditions.push('u.role = ?');
                params.push(role);
            }

            const whereClause = ` WHERE ${conditions.join(' AND ')}`;
            // [FORCE RELOAD TIMESTAMP: 2026-03-28 08:45:00]

            // Get Total Count
            const countRes: any = await getDb(c).execute(
                `SELECT COUNT(*) as total FROM users u ${whereClause}`,
                params
            );
            console.log('[DEBUG-LIST-USERS] countRes:', JSON.stringify(countRes).substring(0, 200));
            const countRows = Array.isArray(countRes) ? countRes : (countRes.rows || []);
            const total = countRows[0]?.total || countRows[0]?.['COUNT(*)'] || 0;

            // Get Data
            const dataRes: any = await getDb(c).execute(
                `SELECT 
                    u.id, u.username, u.email, u.role, u.is_active as isActive, u.created_at as createdAt,
                    r.display_name as roleDisplayName, r.is_super as roleIsSuper, r.level as roleLevel
                 FROM users u
                 LEFT JOIN roles r ON u.role = r.name
                 ${whereClause} 
                 ORDER BY u.created_at ${sort} 
                 LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );
            const rows = Array.isArray(dataRes) ? dataRes : (dataRes.rows || []);
            console.log('[DEBUG-LIST-USERS] data length:', rows.length);

            return c.json({
                status: 'success',
                data: rows,
                meta: {
                    page,
                    limit,
                    total,
                    total_pages: Math.ceil(total / limit)
                }
            });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // Create User
    router.post('/', async (c) => {
        try {
            const { username, email, password, role } = await c.req.json();
            if (!username || !email || !password) {
                return c.json({ status: 'error', message: 'Missing required fields' }, 400);
            }

            const hash = await bcrypt.hash(password, 10);
            
            // Check if exists
            const existing: any = await getDb(c).execute('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
            if ((Array.isArray(existing) && existing.length > 0) || (existing.rows?.length > 0)) {
                return c.json({ status: 'error', message: 'Username or Email already exists' }, 409);
            }

            await getDb(c).execute(
                'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
                [username, email, hash, role || 'user', 1]
            );

            return c.json({ status: 'success', message: 'User created' });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // Update User
    router.put('/:id', async (c) => {
        try {
            const id = c.req.param('id');
            const { username, email, role, is_active } = await c.req.json();
            
            const updates: string[] = [];
            const params: any[] = [];

            if (username) { updates.push('username = ?'); params.push(username); }
            if (email) { updates.push('email = ?'); params.push(email); }
            if (role) { updates.push('role = ?'); params.push(role); }
            if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

            if (updates.length === 0) return c.json({ status: 'error', message: 'No updates provided' }, 400);

            params.push(id);
            await getDb(c).execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

            return c.json({ status: 'success', message: 'User updated' });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // Delete User
    router.delete('/:id', async (c) => {
        try {
            const id = c.req.param('id');
            await getDb(c).execute('DELETE FROM users WHERE id = ?', [id]);
            return c.json({ status: 'success', message: 'User deleted' });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    return router as any;
}
