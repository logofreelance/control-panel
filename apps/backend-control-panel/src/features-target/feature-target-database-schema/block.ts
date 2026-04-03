/**
 * feature-target-database-schema
 * Controls database connection and schema management in the target system.
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

type AppEnv = { Variables: { db: any } };

export function createFeatureTargetDatabaseSchema(envConfig: EnvironmentConfig) {
    const router = new Hono<AppEnv>();

    router.use('*', async (c, next) => {
        c.set('db', buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM));
        await next();
    });

    const q = async (c: any, sql: string, params: any[] = []) => {
        const res: any = await c.get('db').execute(sql, params);
        return Array.isArray(res) ? res : (res.rows || []);
    };

    const handleQueryError = (e: any) => {
        const message = e.message?.includes('database_tables') && (e.message?.includes('not found') || e.message?.includes("doesn't exist"))
            ? `DATABASE MIGRATION REQUIRED: Table 'database_tables' not found. Please run: ALTER TABLE data_sources RENAME TO database_tables;`
            : e.message;
        return { status: 'error', message };
    };

    // Database Schema (formerly Data Sources) CRUD
    router.get('/', async (c) => {
        try {
            return c.json({ status: 'success', data: await q(c, 'SELECT * FROM database_tables ORDER BY created_at DESC') });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });

    // HELPERS: List Templates
    router.get('/templates', async (c) => {
        return c.json({
            status: 'success',
            data: [
                { id: 'blog', name: 'Blog Post', icon: '📝', description: 'Standard blog post schema', schema: { columns: [{ name: 'title', type: 'string', required: true }, { name: 'content', type: 'text' }], timestamps: true } },
                { id: 'products', name: 'Product Catalog', icon: '🛍️', description: 'E-commerce product definition', schema: { columns: [{ name: 'name', type: 'string', required: true }, { name: 'price', type: 'decimal' }], timestamps: true } }
            ]
        });
    });

    // HELPERS: Validate Schema
    router.post('/validate', async (c) => {
        try {
            const body = await c.req.json();
            const name = body.tableName || '';
            const valid = /^[a-z0-9_]+$/.test(name);
            return c.json({
                valid,
                sanitizedTableName: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                errors: valid ? [] : ['Table name contains invalid characters']
            });
        } catch (e: any) { return c.json({ status: 'error', message: e.message }, 500); }
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

    // Alias for frontend .save() which expects /save or /
    const handleCreate = async (c: any) => {
        try {
            const body = await c.req.json();
            const id = crypto.randomUUID();
            // Map frontend tableName to backend table_name
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
    router.put('/:id', async (c) => {
        try {
            const body = await c.req.json();
            await q(c, 'UPDATE database_tables SET display_name = ?, description = ? WHERE id = ?',
                [body.display_name, body.description || '', c.req.param('id')]);
            return c.json({ status: 'success' });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });
    router.post('/:id/archive', async (c) => {
        try {
            await q(c, 'UPDATE database_tables SET is_archived = 1 WHERE id = ?', [c.req.param('id')]);
            return c.json({ status: 'success' });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });
    router.post('/:id/restore', async (c) => {
        try {
            await q(c, 'UPDATE database_tables SET is_archived = 0 WHERE id = ?', [c.req.param('id')]);
            return c.json({ status: 'success' });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });
    router.delete('/:id', async (c) => {
        try {
            await q(c, 'DELETE FROM database_tables WHERE id = ?', [c.req.param('id')]);
            return c.json({ status: 'success' });
        } catch (e: any) {
            return c.json(handleQueryError(e), 500);
        }
    });

    return router as any;
}
