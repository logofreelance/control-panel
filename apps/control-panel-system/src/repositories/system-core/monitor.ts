import { sql, desc } from '@modular/database';
import { createDb, apiLogs } from '@modular/database';
import { DB_TABLES, sanitizeIdentifier } from '@cp/config';
import { CORE_LABELS, IMonitorRepository, MonitorAggregates, LogData } from '@cp/core';

export class DrizzleMonitorRepository implements IMonitorRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async getAggregateStats(): Promise<MonitorAggregates> {
        // Sanitize table name to prevent SQL injection
        const safeTableName = sanitizeIdentifier(DB_TABLES.API_LOGS);
        if (!safeTableName) {
            throw new Error(CORE_LABELS.ERRORS.INVALID_TABLE_CONFIG);
        }

        const statsResult = await this.db.execute(sql.raw(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success,
                AVG(duration_ms) as avg_latency
            FROM \`${safeTableName}\`
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `));

        // Handle MySQL2 result format
        const rows = Array.isArray(statsResult) ? statsResult[0] : statsResult;
        const aggregates = (Array.isArray(rows) && rows[0])
            ? (rows[0] as MonitorAggregates)
            : { total: 0, success: 0, avg_latency: 0 };

        return aggregates;
    }

    async getRecentLogs(limit: number): Promise<LogData[]> {
        const logs = await this.db
            .select()
            .from(apiLogs)
            .orderBy(desc(apiLogs.createdAt))
            .limit(limit);

        return logs.map(l => ({
            id: l.id,
            endpoint: l.endpoint,
            method: l.method,
            statusCode: l.statusCode || 0,
            durationMs: l.durationMs || 0,
            ip: l.ip,
            createdAt: l.createdAt
        }));
    }
}
