import { IApiKeyRepository } from '@cp/middleware';
import { createDb, apiKeys, eq } from '@modular/database';

export class DrizzleApiKeyRepository implements IApiKeyRepository {
    constructor(private dbUrl: string) { }

    async findByKey(key: string): Promise<{ id: number; isActive: boolean } | null> {
        const db = createDb(this.dbUrl);
        const [data] = await db.select({ id: apiKeys.id, isActive: apiKeys.isActive })
            .from(apiKeys)
            .where(eq(apiKeys.key, key))
            .limit(1);
        return data ? { id: data.id, isActive: Boolean(data.isActive) } : null;
    }

    async updateLastUsed(id: number): Promise<void> {
        const db = createDb(this.dbUrl);
        await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
    }
}
