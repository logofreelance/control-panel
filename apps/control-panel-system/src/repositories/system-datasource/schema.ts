import { createDb, eq, sql, dataSources } from '@modular/database';
import { ISchemaRepository, DataSource } from '@cp/datasource-manager';

export class DrizzleSchemaRepository implements ISchemaRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async getSource(id: number): Promise<{ source: DataSource; schema: any }> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        if (!source) throw new Error('Data Source not found');

        const schema = source.schemaJson ? JSON.parse(source.schemaJson as string) : { columns: [] };
        return { source: source as unknown as DataSource, schema };
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
