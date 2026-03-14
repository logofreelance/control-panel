import { desc, createDb, apiLogs } from '@modular/database';
import { IApiLogsRepository, LogData } from '@cp/api-manager';

export class DrizzleApiLogsRepository implements IApiLogsRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async list(limit: number) {
        const logs = await this.db.select().from(apiLogs)
            .orderBy(desc(apiLogs.createdAt))
            .limit(limit);

        return logs.map(l => ({
            id: l.id,
            path: l.endpoint || '',
            method: l.method || '',
            statusCode: l.statusCode || 0,
            duration: l.durationMs || 0,
            ip: l.ip || undefined,
            userAgent: l.userAgent || undefined,
            createdAt: l.createdAt || undefined
        }));
    }

    async save(data: LogData) {
        await this.db.insert(apiLogs).values({
            endpoint: data.path, // Mapping path -> endpoint
            method: data.method,
            statusCode: data.statusCode,
            durationMs: data.duration, // Mapping duration -> durationMs
            ip: data.ip,
            userAgent: data.userAgent
        });
    }
}
