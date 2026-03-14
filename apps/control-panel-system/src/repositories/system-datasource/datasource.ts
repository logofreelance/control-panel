import { createDb, eq, sql, desc, and, dataSources, dataSourceRelations, dataSourceResources, users } from '@modular/database';
import { IDataSourceRepository, DataSource } from '@cp/datasource-manager';

export class DrizzleDataSourceRepository implements IDataSourceRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async list(isArchived: boolean = false): Promise<DataSource[]> {
        return this.db.select().from(dataSources)
            .where(eq(dataSources.isArchived, isArchived))
            .orderBy(desc(dataSources.createdAt)) as unknown as Promise<DataSource[]>;
    }

    async getStats() {
        // Mock stats for now or implement real counts
        const sourceCount = await this.db.select({ count: sql<number>`count(*)` }).from(dataSources);
        return {
            total_sources: Number(sourceCount[0].count),
            total_tables: Number(sourceCount[0].count), // Simplified
            total_records: 0 // Would need aggregation across all tables
        };
    }

    async getById(id: number): Promise<DataSource | null> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        return (source as unknown as DataSource) || null;
    }

    async create(data: Partial<DataSource> & { tableName: string }): Promise<number> {
        const insertResult: any = await this.db.insert(dataSources).values({
            name: data.name!,
            // type: data.type || 'database', // Removed as column does not exist
            tableName: data.tableName,
            schemaJson: data.schemaJson || JSON.stringify({ columns: [] }),
            validationJson: data.validationJson || null,
            rowCount: 0,
            version: 1,
            isSystem: data.isSystem ? true : false,
            isArchived: false
        });

        return insertResult[0]?.insertId || insertResult.insertId;
    }

    async update(id: number, data: Partial<DataSource>): Promise<void> {
        await this.db.update(dataSources).set({
            ...data,
            isArchived: data.isArchived !== undefined ? data.isArchived : undefined,
            isSystem: data.isSystem !== undefined ? data.isSystem : undefined,
            updatedAt: new Date()
        }).where(eq(dataSources.id, id));
    }

    async archive(id: number): Promise<void> {
        await this.db.update(dataSources).set({ isArchived: true }).where(eq(dataSources.id, id));
    }

    async restore(id: number): Promise<void> {
        await this.db.update(dataSources).set({ isArchived: false }).where(eq(dataSources.id, id));
    }

    async destroy(id: number): Promise<void> {
        await this.db.delete(dataSources).where(eq(dataSources.id, id));
    }

    async executeDDL(ddl: string): Promise<void> {
        await this.db.execute(sql.raw(ddl));
    }

    async cleanupResources(dataSourceId: number): Promise<void> {
        // dataSourceColumns does not exist as a table, columns are in schemaJson
        await this.db.delete(dataSourceRelations).where(eq(dataSourceRelations.sourceId, dataSourceId));
        await this.db.delete(dataSourceResources).where(eq(dataSourceResources.dataSourceId, dataSourceId));
    }
}
