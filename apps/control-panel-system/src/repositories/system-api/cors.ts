import { desc, eq, createDb, corsDomains } from '@modular/database';
import { ICorsRepository, CorsDomainData } from '@cp/api-manager';

export class DrizzleCorsRepository implements ICorsRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async findAll(): Promise<CorsDomainData[]> {
        const domains = await this.db.select().from(corsDomains).orderBy(desc(corsDomains.createdAt));
        return domains.map(d => ({
            id: d.id,
            domain: d.domain,
            isActive: d.isActive === null ? undefined : d.isActive
        }));
    }

    async save(domain: string) {
        await this.db.insert(corsDomains).values({ domain });
    }

    async delete(id: number) {
        await this.db.delete(corsDomains).where(eq(corsDomains.id, id));
    }

    async findById(id: number): Promise<CorsDomainData | null> {
        const [d] = await this.db.select().from(corsDomains).where(eq(corsDomains.id, id)).limit(1);
        if (!d) return null;
        return {
            id: d.id,
            domain: d.domain,
            isActive: d.isActive === null ? undefined : d.isActive
        };
    }

    async toggle(id: number) {
        const d = await this.findById(id);
        if (d) {
            await this.db.update(corsDomains)
                .set({ isActive: !d.isActive })
                .where(eq(corsDomains.id, id));
        }
    }
}
