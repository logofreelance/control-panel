import { IApiLogRepository } from '@cp/middleware';
import { createDb, apiLogs } from '@modular/database';

export class DrizzleApiLogRepository implements IApiLogRepository {
    constructor(private dbUrl: string) { }

    async logRequest(data: {
        apiKeyId?: number | null;
        endpoint: string;
        method: string;
        statusCode: number;
        durationMs: number;
        origin?: string | null;
        ip: string;
        userAgent?: string | null;
    }): Promise<void> {
        const db = createDb(this.dbUrl);
        await db.insert(apiLogs).values(data);
    }
}
