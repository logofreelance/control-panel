import { ICorsRepository } from '@cp/middleware';
import { createDb, corsDomains, sql } from '@modular/database';

export class DrizzleCorsRepository implements ICorsRepository {
    constructor(private dbUrl: string) { }

    async findActiveDomains(): Promise<{ domain: string }[]> {
        const db = createDb(this.dbUrl);
        const results = await db.select({ domain: corsDomains.domain })
            .from(corsDomains)
            .where(sql`${corsDomains.isActive} = 1`);
        return results;
    }
}
