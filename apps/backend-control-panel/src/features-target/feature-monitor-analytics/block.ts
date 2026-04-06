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
            // Get aggregates
            const aggRes: any = await getDb(c).execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 ELSE 0 END) as success,
                    AVG(duration_ms) as avg_latency
                FROM route_logs
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);
            const aggRows = Array.isArray(aggRes) ? aggRes : (aggRes.rows || []);
            const aggregates = aggRows[0] || { total: 0, success: 0, avg_latency: 0 };

            // Get recent logs
            const logsRes: any = await getDb(c).execute(`
                SELECT * FROM route_logs 
                ORDER BY created_at DESC LIMIT 50
            `);
            const recentLogs = Array.isArray(logsRes) ? logsRes : (logsRes.rows || []);

            return c.json({
                status: 'success',
                data: {
                    aggregates: {
                        total: Number(aggregates.total || 0),
                        success: Number(aggregates.success || 0),
                        avg_latency: Math.round(Number(aggregates.avg_latency) || 0)
                    },
                    recentLogs
                }
            });
        } catch (err: any) {
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
