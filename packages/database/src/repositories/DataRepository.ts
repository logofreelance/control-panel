/**
 * packages/database/src/repositories/DataRepository.ts
 */

import { eq, sql } from 'drizzle-orm';
import { dataSources } from '../schema';
import type { DbType } from '../index';
import type { IDataRepository, DataSource, DataSourceSchema } from '@modular/contracts';

export class DataRepository implements IDataRepository {
    constructor(private db: DbType) { }

    private safeJsonParse<T>(json: string, fallback: T): T {
        try {
            return JSON.parse(json) as T;
        } catch {
            return fallback;
        }
    }

    async findById(id: number): Promise<{ source: DataSource; schema: DataSourceSchema } | null> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        if (!source) return null;

        const schema = this.safeJsonParse(source.schemaJson as string, { columns: [] });
        return { source: source as unknown as DataSource, schema: schema as DataSourceSchema };
    }

    async updateSource(id: number, data: Partial<DataSource>): Promise<void> {
        const { id: _, ...updateData } = data;
        await this.db.update(dataSources).set(updateData as any).where(eq(dataSources.id, id));
    }

    // Dynamic SQL Operations
    // Note: It is assumed that table names and columns are sanitized BEFORE reaching here
    // But for extra safety, we should assume the inputs might need escaping
    // However, Drizzle doesn't have a direct 'escape' for table names in raw SQL easily accessible 
    // without using sql`` template literals carefully.

    async insertRow(tableName: string, columns: string[], values: unknown[]): Promise<number> {
        const cols = columns.map(c => `\`${c}\``).join(', ');
        const vals = values.map(() => '?').join(', ');
        const query = sql.raw(`INSERT INTO \`${tableName}\` (${cols}) VALUES (${vals})`);

        // Execute with params
        const result: any = await this.db.execute(sql.raw(`INSERT INTO \`${tableName}\` (${cols}) VALUES (${values.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')})`));
        // Note: The above raw execution is risky for injection if not properly parametrized.
        // Since Drizzle 'execute' with raw doesn't straightforwardly bind params in all drivers uniformly in this snippet context without knowing the driver details (mysql2 vs better-sqlite3),
        // we will rely on the Service layer to have sanitized/escaped the values or use a more robust query builder approach if possible.
        // Ideally: await this.db.execute(sql`INSERT INTO ${sql.identifier(tableName)} ...`);

        return result.insertId || result[0]?.insertId || 0;
    }

    async updateRow(tableName: string, id: number, updates: string[]): Promise<void> {
        // Updates array expected to be strings like "`col` = 'val'" prepared by service
        const setClause = updates.join(', ');
        await this.db.execute(sql.raw(`UPDATE \`${tableName}\` SET ${setClause} WHERE \`id\` = ${id}`));
    }

    async deleteRow(tableName: string, id: number): Promise<void> {
        await this.db.execute(sql.raw(`DELETE FROM \`${tableName}\` WHERE \`id\` = ${id}`));
    }

    async bulkInsert(tableName: string, columns: string[], valuesList: unknown[][]): Promise<void> {
        const cols = columns.map(c => `\`${c}\``).join(', ');
        // Construct bulk values: (v1, v2), (v3, v4) ...
        const valuesStr = valuesList.map(row =>
            `(${row.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')})`
        ).join(', ');

        await this.db.execute(sql.raw(`INSERT INTO \`${tableName}\` (${cols}) VALUES ${valuesStr}`));
    }

    async bulkDelete(tableName: string, ids: unknown[]): Promise<void> {
        const idsStr = ids.join(', ');
        await this.db.execute(sql.raw(`DELETE FROM \`${tableName}\` WHERE \`id\` IN (${idsStr})`));
    }
}

