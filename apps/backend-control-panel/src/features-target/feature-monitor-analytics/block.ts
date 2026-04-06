/**
 * feature-monitor-analytics (SaaS REFACTOR)
 * Menyediakan agregasi routing log dan kondisi node backend sasaran
 */
import { Hono } from 'hono';

export function createFeatureMonitorAnalytics() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();
    
    const getDb = (c: any) => c.get('targetDb');

    // Middleware guard
    router.use('*', async (c, next) => {
        if (!getDb(c)) {
            return c.json({ status: 'error', message: 'Target database connection not established. Make sure x-target-id header is provided.' }, 400);
        }
        await next();
    });

    // === DASHBOARD STATS: Aggregates & Recent Logs ===
    router.get('/', async (c) => {
        try {
            const targetDb = getDb(c);
            const targetId = c.get('targetId');
            console.log(`[MONITOR-ANALYTICS] Fetching dashboard stats for target: ${targetId}`);

            // 1. Performance Aggregates (24h) - Isolated to prevent failure if logs table missing
            let aggregates = { total: 0, success: 0, avg_latency: 0 };
            try {
                const aggRes: any = await targetDb.execute(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 ELSE 0 END) as success,
                        AVG(duration_ms) as avg_latency
                    FROM route_logs
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                `);
                const aggRows = Array.isArray(aggRes) ? aggRes : (aggRes.rows || []);
                if (aggRows[0]) {
                    aggregates = {
                        total: Number(aggRows[0].total || 0),
                        success: Number(aggRows[0].success || 0),
                        avg_latency: Math.round(Number(aggRows[0].avg_latency) || 0)
                    };
                }
            } catch (e: any) {
                console.warn(`[MONITOR-ANALYTICS] Stats query failed (possibly missing route_logs): ${e.message}`);
            }

            // 2. Inventory Counts (REAL DATA)
            const inventoryQueries = {
                users: 'SELECT COUNT(*) as count FROM users',
                routes: 'SELECT COUNT(*) as count FROM route_dynamic',
                api_keys: 'SELECT COUNT(*) as count FROM api_keys',
                entities: 'SELECT COUNT(DISTINCT table_name) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name NOT LIKE "route_%" AND table_name NOT LIKE "api_%" AND table_name NOT LIKE "auth_%" AND table_name NOT LIKE "node_%"'
            };

            const inventoryResults: any = {};
            for (const [key, sql] of Object.entries(inventoryQueries)) {
                try {
                    const res: any = await targetDb.execute(sql);
                    const rows = Array.isArray(res) ? res : (res.rows || []);
                    // Robust parsing for different possible column names
                    const countVal = rows[0]?.count ?? rows[0]?.cnt ?? rows[0]?.['COUNT(*)'] ?? 0;
                    inventoryResults[key] = Number(countVal);
                    console.log(`[MONITOR-ANALYTICS] ${key} count: ${inventoryResults[key]}`);
                } catch (e: any) {
                    console.warn(`[MONITOR-ANALYTICS] Table ${key} not found or query failed: ${e.message}`);
                    inventoryResults[key] = 0;
                }
            }

            // 3. Recent Logs - Isolated
            let recentLogs: any[] = [];
            try {
                const logsRes: any = await targetDb.execute(`
                    SELECT * FROM route_logs 
                    ORDER BY created_at DESC LIMIT 50
                `);
                recentLogs = Array.isArray(logsRes) ? logsRes : (logsRes.rows || []);
            } catch (e) {}

            return c.json({
                status: 'success',
                data: {
                    aggregates,
                    inventory: inventoryResults,
                    recentLogs
                }
            });
        } catch (err: any) {
            console.error("[MONITOR-ANALYTICS] Critical endpoint error:", err);
            return c.json({ status: 'error', message: err.message }, 500);
        }
    });

    // === TRAFFIC ANALYTICS: Aggregate API Logs ===
    router.get('/traffic', async (c) => {
        try {
            const res: any = await getDb(c).execute(`
                SELECT DATE(created_at) as date, COUNT(*) as count, AVG(duration_ms) as avg_response_time 
                FROM route_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at) 
                ORDER BY date ASC
            `);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            const chartData = rows.map((row: any) => ({
                date: row.date,
                requests: Number(row.count),
                avgResponseTime: Math.round(Number(row.avg_response_time) || 0),
            }));
            return c.json({ status: 'success', data: chartData });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    // === TOP ENDPOINTS: Most called endpoints ===
    router.get('/top-endpoints', async (c) => {
        try {
            const res: any = await getDb(c).execute(`
                SELECT endpoint, method, COUNT(*) as total_hits, AVG(duration_ms) as avg_latency,
                       SUM(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 ELSE 0 END) as success_count,
                       SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
                FROM route_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY endpoint, method ORDER BY total_hits DESC LIMIT 10
            `);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            const data = rows.map((row: any) => ({
                endpoint: row.endpoint, method: row.method, totalHits: Number(row.total_hits),
                avgLatency: Math.round(Number(row.avg_latency) || 0),
                successCount: Number(row.success_count), errorCount: Number(row.error_count),
            }));
            return c.json({ status: 'success', data });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    return router as any;
}
