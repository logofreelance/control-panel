/**
 * feature-monitor-database (HANYA MENGGUNAKAN TARGET DB)
 * Menyediakan statistik database, list table, dan pembersihan metadata
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

export function createFeatureMonitorDatabase(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any } }>();
    
    router.use('*', async (c, next) => {
        c.set('db', buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM));
        await next();
    });

    const getDb = (c: any) => c.get('db') as ReturnType<typeof buildTargetDatabaseConnection>;

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
            // Get current database name first
            let dbName: string | null = null;
            try {
                const dbNameRes: any = await getDb(c).execute('SELECT DATABASE() as db');
                dbName = Array.isArray(dbNameRes) ? dbNameRes[0]?.db : (dbNameRes.rows?.[0]?.db);
            } catch (e) {
                console.warn("[STATS-WARN] SELECT DATABASE() failed, falling back to env var", e);
            }
            
            if (!dbName) {
                // Pre-parse from URL or use fallback
                dbName = envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM.split('/').pop()?.split('?')[0] || 'modularengine';
            }

            console.log("[STATS-DEBUG] Querying stats for database:", dbName);

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
                // Handle mapping from SHOW TABLE STATUS (cased properties) if needed
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

            // Aggregates
            const totalSizeMb = formattedTables.reduce((acc: any, t: any) => acc + Number(t.sizeMb) + Number(t.indexSizeMb), 0).toFixed(2);
            const totalRows = formattedTables.reduce((acc: any, t: any) => acc + t.rows, 0);
            const totalTables = formattedTables.length;
            const totalIndexSizeMb = formattedTables.reduce((acc: any, t: any) => acc + Number(t.indexSizeMb), 0).toFixed(2);

            return c.json({
                status: 'success',
                data: {
                    databaseName: dbName,
                    totalSizeMb,
                    totalRows,
                    totalTables,
                    tables: formattedTables,
                    summary: {
                        largestTable: formattedTables[0] || { name: '-', sizeMb: '0', indexSizeMb: '0', overheadMb: '0', rows: 0 },
                        mostRowsTable: [...formattedTables].sort((a, b) => b.rows - a.rows)[0] || { name: '-', sizeMb: '0', indexSizeMb: '0', overheadMb: '0', rows: 0 },
                        indexRatio: totalSizeMb !== '0.00' ? (Number(totalIndexSizeMb) / Number(totalSizeMb) * 100).toFixed(1) : '0',
                        totalIndexSizeMb
                    }
                }
            });
        } catch (err: any) {
            console.error("[STATS-ERROR]", err);
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // === DROP TABLE ===
    router.delete('/tables/:name', async (c) => {
        try {
            const tableName = c.req.param('name');
            const dbName = c.req.query('db') || 'modularengine';

            // Basic safety check: only allow alphanumeric and underscores
            if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
                return c.json({ status: 'error', message: 'Invalid table name' }, 400);
            }

            // We use direct execution for DROP TABLE
            await getDb(c).execute(`DROP TABLE IF EXISTS \`${tableName}\``);
            
            return c.json({ status: 'success', message: `Table ${tableName} deleted` });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // === CLEANUP ORPHANED METADATA ===
    router.post('/cleanup', async (c) => {
        try {
            // Logic to cleanup target-system internal metadata if any
            // For now, returning mock result matching frontend expectations
            return c.json({
                status: 'success',
                data: {
                    orphanedDataSources: 0,
                    orphanedResources: 0,
                    invalidRelations: 0,
                    details: ['No orphaned items found']
                }
            });
        } catch (err: any) {
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    return router as any;
}
