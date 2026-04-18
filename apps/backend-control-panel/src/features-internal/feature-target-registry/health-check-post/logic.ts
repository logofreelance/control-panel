/**
 * health-check-post/logic.ts
 */
import { connect } from '@tidbcloud/serverless';
import * as model from './model';

export async function performHealthCheck(db: any, targetId: string) {
    const row = await model.findTargetSystemById(db, targetId);
    if (!row) throw new Error('Target system not found');

    const start = Date.now();
    try {
        const httpUrl = row.database_url.replace('mysql://', 'https://').replace(':4000', '');
        const targetDb = connect({ url: httpUrl });

        await targetDb.execute('SELECT 1');

        let routeCount = 0;
        try {
            const countRes: any = await targetDb.execute('SELECT COUNT(*) as cnt FROM route_dynamic WHERE is_active = 1');
            const rows = Array.isArray(countRes) ? countRes : (countRes.rows || []);
            routeCount = rows.length > 0 ? Number(rows[0]?.cnt || rows[0]?.['COUNT(*)'] || 0) : 0;
        } catch {}

        let detectedApiEndpoint = '';
        try {
            const nodeRes: any = await targetDb.execute(`
                SELECT DISTINCT endpoint_url 
                FROM node_health_metrics 
                WHERE status = 'online' 
                  AND last_heartbeat >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            `);
            const rows = Array.isArray(nodeRes) ? nodeRes : (nodeRes.rows || []);
            const validEndpoints = rows.map((r: any) => r.endpoint_url).filter((url: string) => url && url.startsWith('http'));
            if (validEndpoints.length > 0) detectedApiEndpoint = validEndpoints.join(',');
        } catch {}

        const latencyMs = Date.now() - start;

        await model.updateTargetSystemApiEndpoint(db, targetId, detectedApiEndpoint);
        await model.updateTargetSystemHealth(db, targetId, 'online', routeCount);

        return { ok: true, latencyMs, routeCount, status: 'online' };
    } catch (err: any) {
        const latencyMs = Date.now() - start;
        await model.updateTargetSystemHealth(db, targetId, 'offline', 0);
        return { ok: false, latencyMs, routeCount: 0, status: 'offline', error: err?.message || 'Connection failed' };
    }
}
