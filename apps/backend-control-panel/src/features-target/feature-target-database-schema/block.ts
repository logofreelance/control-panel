/**
 * feature-target-database-schema (SaaS REFACTOR)
 * Controls database connection and schema management in the target system.
 */
import { Hono } from 'hono';

type AppEnv = { Variables: { targetDb: any, targetId: string } };

export function createFeatureTargetDatabaseSchema() {
    const router = new Hono<AppEnv>();

    const getDb = (c: any) => c.get('targetDb');

    // Middleware guard
    router.use('*', async (c, next) => {
        if (!getDb(c)) {
            return c.json({ status: 'error', message: 'Target database connection not established. Make sure x-target-id header is provided.' }, 400);
        }
        await next();
    });

    const q = async (c: any, sql: string, params: any[] = []) => {
        const res: any = await getDb(c).execute(sql, params);
        return Array.isArray(res) ? res : (res.rows || []);
    };

    const handleQueryError = (e: any) => {
        const message = e.message?.includes('database_tables') && (e.message?.includes('not found') || e.message?.includes("doesn't exist"))
            ? `DATABASE MIGRATION REQUIRED: Table 'database_tables' not found. Please run: ALTER TABLE data_sources RENAME TO database_tables;`
            : e.message;
        return { status: 'error', message };
    };

    // Database Schema CRUD
    router.get('/', async (c) => {
        try {
            return c.json({ status: 'success', data: await q(c, 'SELECT * FROM database_tables ORDER BY created_at DESC') });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });

    router.get('/stats', async (c) => {
        try {
            const total = await q(c, 'SELECT COUNT(*) as total FROM database_tables');
            const active = await q(c, 'SELECT COUNT(*) as active FROM database_tables WHERE is_archived = 0');
            return c.json({ status: 'success', data: { total: total[0]?.total || 0, active: active[0]?.active || 0 } });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });

    const handleCreate = async (c: any) => {
        try {
            const body = await c.req.json();
            const id = crypto.randomUUID();
            const tableName = body.tableName || body.table_name || body.name;
            const displayName = body.name || body.display_name || tableName;

            await q(c, `INSERT INTO database_tables (id, name, table_name, display_name, description, connection_config)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                [id, displayName, tableName, displayName, body.description || '', JSON.stringify(body.connection_config || {})]);
            return c.json({ status: 'success', data: { id } });
        } catch (e: any) { return c.json({ status: 'error', message: e.message }, 500); }
    };

    router.post('/', handleCreate);
    router.post('/save', handleCreate);

    router.get('/:id', async (c) => {
        try {
            const rows = await q(c, 'SELECT * FROM database_tables WHERE id = ?', [c.req.param('id')]);
            return rows.length ? c.json({ status: 'success', data: rows[0] }) : c.json({ status: 'error', message: 'Not found' }, 404);
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });

    return router as any;
}
