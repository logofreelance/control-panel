/**
 * feature-target-database-schema (SaaS REFACTOR)
 * Controls database connection and schema management in the target system.
 */
import { Hono } from 'hono';

type AppEnv = { Variables: { targetDb: any, targetId: string } };

export function createFeatureTargetDatabaseSchema() {
    const router = new Hono<AppEnv>();

    const getDb = (c: any) => c.get('targetDb');

    const checkAndCreateTable = async (c: any) => {
        try {
            const db = getDb(c);
            // Check if table exists
            const exists: any = await db.execute("SHOW TABLES LIKE 'database_tables'");
            const existsRows = Array.isArray(exists) ? exists : (exists.rows || []);
            if (existsRows.length > 0) return true;

            // Check if old table exists for migration
            const oldExists: any = await db.execute("SHOW TABLES LIKE 'data_sources'");
            const oldExistsRows = Array.isArray(oldExists) ? oldExists : (oldExists.rows || []);
            if (oldExistsRows.length > 0) {
                await db.execute("RENAME TABLE data_sources TO database_tables");
                return true;
            }

            // Create new table
            await db.execute(`
                CREATE TABLE database_tables (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    table_name VARCHAR(255) NOT NULL,
                    display_name VARCHAR(255),
                    description TEXT,
                    is_archived TINYINT DEFAULT 0,
                    connection_config TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            return true;
        } catch (e: any) {
            console.error("[SCHEMA] Table init failed:", e.message);
            return false;
        }
    };

    // Middleware guard
    router.use('*', async (c, next) => {
        if (!getDb(c)) {
            return c.json({ status: 'error', message: 'Target database connection not established. Make sure x-target-id header is provided.' }, 400);
        }
        await checkAndCreateTable(c);
        await next();
    });

    const q = async (c: any, sql: string, params: any[] = []) => {
        const res: any = await getDb(c).execute(sql, params);
        return Array.isArray(res) ? res : (res.rows || []);
    };

    const handleQueryError = (e: any) => {
        return { status: 'error', message: e.message };
    };

    // Database Schema CRUD
    router.get('/', async (c) => {
        try {
            const data = await q(c, 'SELECT * FROM database_tables WHERE is_archived = 0 ORDER BY created_at DESC');
            return c.json({ status: 'success', data });
        } catch (e: any) {
            return c.json({ status: 'success', data: [] }); // Safe fallback
        }
    });

    router.get('/stats', async (c) => {
        try {
            const totalRes = await q(c, 'SELECT COUNT(*) as total FROM database_tables');
            const activeRes = await q(c, 'SELECT COUNT(*) as active FROM database_tables WHERE is_archived = 0');
            return c.json({ 
                status: 'success', 
                data: { 
                    total: Number(totalRes[0]?.total || totalRes[0]?.['COUNT(*)'] || 0), 
                    active: Number(activeRes[0]?.active || activeRes[0]?.['COUNT(*)'] || 0) 
                } 
            });
        } catch (e: any) {
            return c.json({ status: 'success', data: { total: 0, active: 0 } });
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
