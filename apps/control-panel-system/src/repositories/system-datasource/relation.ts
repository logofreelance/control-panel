import { createDb, eq, sql, dataSources } from '@modular/database';
import { IRelationRepository, DataSource } from '@cp/datasource-manager';

export class DrizzleRelationRepository implements IRelationRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async getSource(id: number): Promise<DataSource> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        if (!source) throw new Error('Source not found');
        return source as unknown as DataSource;
    }

    async getTarget(id: number): Promise<DataSource> {
        const [target] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        if (!target) throw new Error('Target not found');
        return target as unknown as DataSource;
    }

    async getAllSources(): Promise<{ id: number; name: string; tableName: string; }[]> {
        return this.db.select({
            id: dataSources.id,
            name: dataSources.name,
            tableName: dataSources.tableName
        }).from(dataSources);
    }

    async getAvailableTargets(excludeId: number): Promise<{ id: number; name: string; tableName: string; }[]> {
        return this.db.select({
            id: dataSources.id,
            name: dataSources.name,
            tableName: dataSources.tableName
        }).from(dataSources)
            .where(sql`${dataSources.id} != ${excludeId} AND ${dataSources.isArchived} = false`);
    }

    async updateSchema(id: number, schema: any, version: number): Promise<void> {
        await this.db.update(dataSources).set({
            schemaJson: JSON.stringify(schema),
            version: version,
            updatedAt: new Date()
        }).where(eq(dataSources.id, id));
    }

    async executeDDL(ddl: string): Promise<void> {
        await this.db.execute(sql.raw(ddl));
    }
}
