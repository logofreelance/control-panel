import { SystemService, SystemHonoHandlers } from '@cp/core';
import { DrizzleSystemRepository } from '../../repositories/system-core/system';
import { createDb, nodeHealthMetrics } from '@modular/database';
import { Hono } from 'hono';

export const systemRouter = new Hono();

const repo = new DrizzleSystemRepository(createDb as any);
const service = new SystemService(repo);
const handlers = new SystemHonoHandlers(service);

// System status
systemRouter.get('/system-status', handlers.getStatus);

// Database URL validation
systemRouter.post('/validate-db-url', handlers.validate);

// Database setup
systemRouter.post('/setup-db', handlers.setup);

// Admin installation
systemRouter.post('/install', handlers.install);

// Run migrations
systemRouter.post('/run-migrations', handlers.migrate);

// === SERVICE DISCOVERY: List of active backend nodes ===
systemRouter.get('/nodes-health', async (c) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        return c.json({ status: 'error', message: 'DATABASE_URL not configured' }, 500);
    }
    try {
        const db = createDb(dbUrl);
        const now = Date.now();
        const OFFLINE_THRESHOLD_MS = 30_000; // 30 seconds

        const rows = await db.select().from(nodeHealthMetrics).orderBy(nodeHealthMetrics.lastHeartbeat);

        // Annotate each node with live status based on heartbeat age
        const nodes = rows.map(row => {
            const lastBeat = row.lastHeartbeat ? new Date(row.lastHeartbeat).getTime() : 0;
            const ageMs = now - lastBeat;
            const isOnline = ageMs < OFFLINE_THRESHOLD_MS;
            return {
                nodeId: row.nodeId,
                endpointUrl: row.endpointUrl,
                cpuUsage: row.cpuUsage,
                memoryUsage: row.memoryUsage,
                uptime: row.uptime,
                status: isOnline ? 'online' : 'offline',
                lastHeartbeat: row.lastHeartbeat,
            };
        });

        return c.json({ status: 'success', data: nodes });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return c.json({ status: 'error', message: msg }, 500);
    }
});

// === TRAFFIC ANALYTICS: Aggregate API Logs ===
import { sql } from 'drizzle-orm';
import { apiLogs } from '@modular/database';

systemRouter.get('/analytics/traffic', async (c) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return c.json({ status: 'error', message: 'DATABASE_URL not configured' }, 500);

    try {
        const db = createDb(dbUrl);
        
        // Group by Date for the last 30 days
        const query = sql`
            SELECT 
                DATE(created_at) as date, 
                COUNT(*) as count, 
                AVG(duration_ms) as avg_response_time 
            FROM api_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        `;
        
        const result: any = await db.execute(query);
        const rows = result?.rows || result || [];
        
        // Format for frontend charts
        const chartData = rows.map((row: any) => ({
            date: row.date,
            requests: row.count,
            avgResponseTime: Math.round(row.avg_response_time || 0)
        }));

        return c.json({ status: 'success', data: chartData });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return c.json({ status: 'error', message: msg }, 500);
    }
});

// === TOP ENDPOINTS: Most called endpoints ===
systemRouter.get('/analytics/top-endpoints', async (c) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return c.json({ status: 'error', message: 'DATABASE_URL not configured' }, 500);

    try {
        const db = createDb(dbUrl);
        const query = sql`
            SELECT 
                endpoint,
                method,
                COUNT(*) as total_hits,
                AVG(duration_ms) as avg_latency,
                SUM(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 ELSE 0 END) as success_count,
                SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
            FROM api_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY endpoint, method
            ORDER BY total_hits DESC
            LIMIT 10
        `;
        const result: any = await db.execute(query);
        const rows = result?.rows || result || [];
        const data = rows.map((row: any) => ({
            endpoint: row.endpoint,
            method: row.method,
            totalHits: Number(row.total_hits),
            avgLatency: Math.round(Number(row.avg_latency) || 0),
            successCount: Number(row.success_count),
            errorCount: Number(row.error_count),
        }));
        return c.json({ status: 'success', data });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return c.json({ status: 'error', message: msg }, 500);
    }
});

// === ERROR DISTRIBUTION: Status code breakdown ===
systemRouter.get('/analytics/error-distribution', async (c) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return c.json({ status: 'error', message: 'DATABASE_URL not configured' }, 500);

    try {
        const db = createDb(dbUrl);
        const query = sql`
            SELECT 
                CASE 
                    WHEN status_code >= 200 AND status_code < 300 THEN '2xx'
                    WHEN status_code >= 300 AND status_code < 400 THEN '3xx'
                    WHEN status_code >= 400 AND status_code < 500 THEN '4xx'
                    WHEN status_code >= 500 THEN '5xx'
                    ELSE 'other'
                END as category,
                COUNT(*) as count
            FROM api_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY category
            ORDER BY category ASC
        `;
        const result: any = await db.execute(query);
        const rows = result?.rows || result || [];
        const data = rows.map((row: any) => ({
            category: row.category,
            count: Number(row.count),
        }));
        return c.json({ status: 'success', data });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return c.json({ status: 'error', message: msg }, 500);
    }
});

// === STORAGE HEALTH CHECK: DB ping + connection diagnostics ===
systemRouter.get('/storage/health-check', async (c) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return c.json({ status: 'error', message: 'DATABASE_URL not configured' }, 500);

    try {
        const db = createDb(dbUrl);
        const pingStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const pingMs = Date.now() - pingStart;

        // Get DB version
        const versionResult: any = await db.execute(sql`SELECT VERSION() as version`);
        const vRows = versionResult?.rows || versionResult || [];
        const version = vRows[0]?.version || 'Unknown';

        // Get total rows in key tables
        const rowCountsResult: any = await db.execute(sql`
            SELECT 
                (SELECT COUNT(*) FROM api_logs) as log_count,
                (SELECT COUNT(*) FROM node_health_metrics) as node_count
        `);
        const rcRows = rowCountsResult?.rows || rowCountsResult || [];

        return c.json({
            status: 'success',
            data: {
                pingMs,
                version,
                healthy: pingMs < 5000,
                totalLogs: Number(rcRows[0]?.log_count || 0),
                totalNodes: Number(rcRows[0]?.node_count || 0),
            }
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return c.json({ status: 'error', data: { healthy: false, pingMs: -1, error: msg } }, 500);
    }
});

// === SLOW QUERIES: Slowest API requests from logs ===
systemRouter.get('/storage/slow-queries', async (c) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return c.json({ status: 'error', message: 'DATABASE_URL not configured' }, 500);

    try {
        const db = createDb(dbUrl);
        const query = sql`
            SELECT 
                endpoint,
                method,
                status_code,
                duration_ms,
                ip,
                created_at
            FROM api_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY duration_ms DESC
            LIMIT 10
        `;
        const result: any = await db.execute(query);
        const rows = result?.rows || result || [];
        const data = rows.map((row: any) => ({
            endpoint: row.endpoint,
            method: row.method,
            statusCode: Number(row.status_code),
            durationMs: Number(row.duration_ms),
            ip: row.ip,
            createdAt: row.created_at,
        }));
        return c.json({ status: 'success', data });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return c.json({ status: 'error', message: msg }, 500);
    }
});


