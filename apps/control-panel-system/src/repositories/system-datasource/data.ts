import { createDb, eq, sql, dataSources } from '@modular/database';
import { IDataRepository, DataSource } from '@cp/datasource-manager';

export class DrizzleDataRepository implements IDataRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async findById(id: number): Promise<DataSource | null> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        return (source as unknown as DataSource) || null;
    }

    async updateSource(id: number, data: Partial<DataSource>): Promise<void> {
        await this.db.update(dataSources).set({
            ...data,
            updatedAt: new Date()
        }).where(eq(dataSources.id, id));
    }

    async insertRow(tableName: string, columns: string[], values: any[]): Promise<number> {
        const cols = columns.map(c => `\`${c}\``).join(', ');

        // Construct SQL chunks for safety with parameterized values
        const chunks = [sql.raw(`INSERT INTO \`${tableName}\` (${cols}) VALUES (`)];

        values.forEach((v, i) => {
            chunks.push(sql`${v}`);
            if (i < values.length - 1) chunks.push(sql.raw(', '));
        });
        chunks.push(sql.raw(')'));

        const finalQuery = sql.join(chunks, sql.raw(''));
        const res: any = await this.db.execute(finalQuery);

        // Handle TiDB/MySQL insertId
        return res[0]?.insertId || res.insertId;
    }

    async updateRow(tableName: string, rowId: number, updates: string[]): Promise<void> {
        // updates are strings like "`col` = 'val'" constructed by service.
        // The service MUST handle escaping if passing raw strings. 
        // Ideally we'd accept object and parameterize, but matching interface.
        const setClause = updates.join(', ');
        const query = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`id\` = ${rowId}`;
        await this.db.execute(sql.raw(query));
    }

    async deleteRow(tableName: string, rowId: number): Promise<void> {
        const query = `DELETE FROM \`${tableName}\` WHERE \`id\` = ${rowId}`;
        await this.db.execute(sql.raw(query));
    }

    async bulkInsert(tableName: string, columns: string[], valuesList: any[][]): Promise<void> {
        const cols = columns.map(c => `\`${c}\``).join(', ');

        const chunks = [sql.raw(`INSERT INTO \`${tableName}\` (${cols}) VALUES `)];

        valuesList.forEach((row, i) => {
            chunks.push(sql.raw('('));
            row.forEach((v, j) => {
                chunks.push(sql`${v}`);
                if (j < row.length - 1) chunks.push(sql.raw(', '));
            });
            chunks.push(sql.raw(')'));
            if (i < valuesList.length - 1) chunks.push(sql.raw(', '));
        });

        await this.db.execute(sql.join(chunks, sql.raw('')));
    }

    async bulkDelete(tableName: string, ids: any[]): Promise<void> {
        if (ids.length === 0) return;

        const chunks = [sql.raw(`DELETE FROM \`${tableName}\` WHERE \`id\` IN (`)];
        ids.forEach((id, i) => {
            chunks.push(sql`${id}`);
            if (i < ids.length - 1) chunks.push(sql.raw(', '));
        });
        chunks.push(sql.raw(')'));

        await this.db.execute(sql.join(chunks, sql.raw('')));
    }
}
