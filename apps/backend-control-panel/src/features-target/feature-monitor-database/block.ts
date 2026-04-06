/**
 * feature-monitor-database (SaaS REFACTOR)
 * Menyediakan statistik database, list table, dan pembersihan metadata
 */
import { Hono } from 'hono';

export function createFeatureMonitorDatabase() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();
    
    const getDb = (c: any) => c.get('targetDb');

    // Middlewares guard
    router.use('*', async (c, next) => {
        if (!getDb(c)) {
            return c.json({ status: 'error', message: 'Target database connection not established. Make sure x-target-id header is provided.' }, 400);
        }
        await next();
    });

    // === TEST CONNECTIVITY ===
    router.get('/test', async (c) => {
        try {
            const res = await getDb(c).execute('SELECT 1 as connected, DATABASE() as db');
            return c.json({ status: 'success', data: res });
        } catch (err: any) {
            console.error("[STATS-TEST-ERROR]", err);
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // === DATABASE STATS: Tables, Rows, and Sizes ===
    router.get('/stats', async (c) => {
        try {
            // Get current database name
            let dbName: string | null = null;
            try {
                const dbNameRes: any = await getDb(c).execute('SELECT DATABASE() as db');
                const rows = Array.isArray(dbNameRes) ? dbNameRes : (dbNameRes.rows || []);
                dbName = rows.length > 0 ? rows[0]?.db : null;
            } catch (e) {
                console.warn("[STATS-WARN] SELECT DATABASE() failed", e);
            }
            
            if (!dbName) dbName = 'unknown';

            // Get all tables stats
            let res: any;
            let usingFallback = false;
            try {
                res = await getDb(c).execute(`
                    SELECT 
                        TABLE_NAME as name, 
                        TABLE_ROWS as rowCount, 
                        ROUND(DATA_LENGTH / 1024 / 1024, 2) as sizeMb, 
                        ROUND(INDEX_LENGTH / 1024 / 1024, 2) as indexSizeMb, 
                        ROUND(DATA_FREE / 1024 / 1024, 2) as overheadMb 
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = ?
                    ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
                `, [dbName]);
            } catch (e) {
                console.warn("[STATS-WARN] information_schema query failed, trying SHOW TABLE STATUS", e);
                res = await getDb(c).execute(`SHOW TABLE STATUS`);
                usingFallback = true;
            }

            const tables = Array.isArray(res) ? res : (res.rows || []);
            const formattedTables = tables.map((t: any) => {
                if (usingFallback) {
                    return {
                        name: t.Name || t.name,
                        rows: Number(t.Rows || t.rows || 0),
                        sizeMb: ((t.Data_length || 0) / 1024 / 1024).toFixed(2),
                        indexSizeMb: ((t.Index_length || 0) / 1024 / 1024).toFixed(2),
                        overheadMb: ((t.Data_free || 0) / 1024 / 1024).toFixed(2)
                    };
                }
                return {
                    name: t.name,
                    rows: Number(t.rowCount || t.rows || 0),
                    sizeMb: String(t.sizeMb || '0'),
                    indexSizeMb: String(t.indexSizeMb || '0'),
                    overheadMb: String(t.overheadMb || '0')
                };
            });

            const totalSizeMb = formattedTables.reduce((acc: any, t: any) => acc + Number(t.sizeMb) + Number(t.indexSizeMb), 0).toFixed(2);
            const totalRows = formattedTables.reduce((acc: any, t: any) => acc + t.rows, 0);

            return c.json({
                status: 'success',
                data: {
                    databaseName: dbName,
                    totalSizeMb,
                    totalRows,
                    totalTables: formattedTables.length,
                    tables: formattedTables
                }
            });
        } catch (err: any) {
            console.error("[STATS-ERROR]", err);
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    return router as any;
}
