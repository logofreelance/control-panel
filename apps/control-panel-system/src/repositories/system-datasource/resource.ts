import { createDb, eq, desc, dataSources, dataSourceResources } from '@modular/database';
import { IResourceRepository, DataSource } from '@cp/datasource-manager';

export class DrizzleResourceRepository implements IResourceRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async list(dataSourceId: number): Promise<any[]> {
        return this.db.select().from(dataSourceResources)
            .where(eq(dataSourceResources.dataSourceId, dataSourceId))
            .orderBy(desc(dataSourceResources.createdAt));
    }

    async create(data: any): Promise<number> {
        // Handling insertId similar to DataSourceRepo
        const insertResult: any = await this.db.insert(dataSourceResources).values(data);
        return insertResult[0]?.insertId || insertResult.insertId;
    }

    async update(id: number, data: any): Promise<void> {
        await this.db.update(dataSourceResources).set(data).where(eq(dataSourceResources.id, id));
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(dataSourceResources).where(eq(dataSourceResources.id, id));
    }

    async findById(id: number): Promise<any> {
        const [res] = await this.db.select().from(dataSourceResources).where(eq(dataSourceResources.id, id)).limit(1);
        return res;
    }

    async getSource(id: number): Promise<DataSource> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        if (!source) throw new Error('Data Source not found');
        return source as unknown as DataSource;
    }

    async getResource(id: number): Promise<any | null> {
        return this.findById(id);
    }

    async getDataSource(id: number): Promise<DataSource | null> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        return (source as unknown as DataSource) || null;
    }
}
