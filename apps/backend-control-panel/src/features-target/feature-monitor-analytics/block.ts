/**
 * feature-monitor-analytics (HANYA MENGGUNAKAN TARGET DB)
 * Menyediakan agregasi routing log dan kondisi node backend sasaran
 */
import { Hono } from 'hono';
import { buildTargetDatabaseConnection } from '../target.db';
import type { EnvironmentConfig } from '../../env';

export function createFeatureMonitorAnalytics(envConfig: EnvironmentConfig) {
    const router = new Hono<{ Variables: { db: any } }>();
    
    router.use('*', async (c, next) => {
        c.set('db', buildTargetDatabaseConnection(envConfig.DATABASE_URL_TARGET_BACKEND_SYSTEM));
        await next();
    });

    const getDb = (c: any) => c.get('db') as ReturnType<typeof buildTargetDatabaseConnection>;

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

    // === ERROR DISTRIBUTION ===
    router.get('/error-distribution', async (c) => {
        try {
            const res: any = await getDb(c).execute(`
                SELECT CASE 
                    WHEN status_code >= 200 AND status_code < 300 THEN '2xx'
                    WHEN status_code >= 300 AND status_code < 400 THEN '3xx'
                    WHEN status_code >= 400 AND status_code < 500 THEN '4xx'
                    WHEN status_code >= 500 THEN '5xx' ELSE 'other'
                END as category, COUNT(*) as count
                FROM route_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY category ORDER BY category ASC
            `);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            const data = rows.map((row: any) => ({ category: row.category, count: Number(row.count) }));
            return c.json({ status: 'success', data });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    // === NODES HEALTH ===
    router.get('/nodes-health', async (c) => {
        try {
            const res: any = await getDb(c).execute(`SELECT * FROM node_health_metrics ORDER BY lastHeartbeat`);
            const rows = Array.isArray(res) ? res : (res.rows || []);
            const OFFLINE_THRESHOLD_MS = 30000;
            const STALE_THRESHOLD_MS = 5 * 60 * 1000;
            const now = Date.now();
            const nodes = rows.map((r: any) => {
                const ageMs = now - new Date(r.lastHeartbeat).getTime();
                return {
                    nodeId: r.nodeId, endpointUrl: r.endpointUrl, cpuUsage: r.cpuUsage,
                    memoryUsage: r.memoryUsage, uptime: r.uptime, status: ageMs < OFFLINE_THRESHOLD_MS ? 'online' : 'offline',
                    lastHeartbeat: r.lastHeartbeat, _ageMs: ageMs
                };
            }).filter((n: any) => n._ageMs < STALE_THRESHOLD_MS).map(({ _ageMs, ...rest }: any) => rest);
            return c.json({ status: 'success', data: nodes });
        } catch (err: any) { return c.json({ status: 'error', message: err.message }, 500); }
    });

    return router as any;
}
