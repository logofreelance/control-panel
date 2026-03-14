import { createDb, eq, sql, dataSources, apiMutationLogs } from '@modular/database';
import { IMutationRepository } from '@cp/datasource-manager';

export class DrizzleMutationRepository implements IMutationRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async getSchema(dataSourceId: number): Promise<any | null> {
        const [source] = await this.db.select({
            schemaJson: dataSources.schemaJson,
        }).from(dataSources).where(eq(dataSources.id, dataSourceId)).limit(1);

        if (!source?.schemaJson) return null;
        try {
            return JSON.parse(source.schemaJson as string);
        } catch {
            return null;
        }
    }

    async getTableName(dataSourceId: number): Promise<string | null> {
        const [source] = await this.db.select({
            tableName: dataSources.tableName,
        }).from(dataSources).where(eq(dataSources.id, dataSourceId)).limit(1);

        return source?.tableName || null;
    }

    async getRecord(tableName: string, recordId: number): Promise<any | null> {
        try {
            const query = `SELECT * FROM \`${tableName}\` WHERE \`id\` = ${recordId} LIMIT 1`;
            const result: any = await this.db.execute(sql.raw(query));
            const rows = result[0] as any[];
            return rows?.[0] || null;
        } catch {
            return null;
        }
    }

    async executeMutation(query: string): Promise<void> {
        await this.db.execute(sql.raw(query));
    }

    async executeInsert(query: string, values: any[]): Promise<number> {
        // Here we ideally use values for parameter binding. 
        // Assuming query has ? placeholders.

        let finalQuery = query;
        if (values && values.length > 0) {
            // Very naive substitution if driver doesn't support parameterized exec easily in Drizzle abstract
            // But we should use sql template if possible.
            // Given the complexity of rebuild, and that values are escaped in Service (escapeSQL),
            // MutationService basically builds a query string with safe values.
            // Wait, I updated MutationService to use placeholders (?) or escapeSQL?
            // "const escapedValue = escapeSQL(value); paramQuery = paramQuery.replace(SQL.PLACEHOLDER, escapedValue);"
            // So MutationService sends a COMPLETE query string if it does replacement itself.

            // Checking MutationService logic:
            // "await this.repo.executeInsert(query, values);"
            // It calls `executeInsert(query, values)`
            // But before that:
            // "const { query, values } = this.buildInsertQuery(...)"
            // "const newId = await this.repo.executeInsert(query, values);"

            // It does NOT do replacement anymore in my refactor?
            // Let's check `MutationService` refactored code.
            // "const { query, values } = this.buildInsertQuery(tableName, processedData);"
            // "const newId = await this.repo.executeInsert(query, values);"

            // So `query` has `?` placeholders.
            // I need to bind them.

            const dynamicSql = sql.raw(query);
            // Drizzle doesn't easily allow binding array to raw sql string without rebuilding it as chunks.
            // BUT, `mysql2` driver (underlying) supports `execute(sql, values)`.
            // Drizzle's `db.execute(sql)` ... `sql` object can carry params.

            // How to attach params to `sql.raw`?
            // `sql.raw(query)` creates a SQL chunk without params.
            // I can construct a SQL object manually? 

            // Let's try to map placeholders.
            // Or assume `backend-orange` can use `db.execute(sql.raw(query), values)`? No, Drizzle signature is `execute(query: SQLWrapper)`.

            // Alternative: Rebuild SQL object.
            // Splitting query by `?` is risky if `?` is in string literals.

            // Hack for now: Manually replace `?` with escaped values (using logic similar to what I removed from service).
            // OR use `sql` tagged template.

            // To support `?` bindings correctly:
            const chunks = query.split('?');
            const sqlChunks: any[] = [];

            chunks.forEach((chunk, i) => {
                sqlChunks.push(sql.raw(chunk));
                if (i < chunks.length - 1 && i < values.length) {
                    sqlChunks.push(sql`${values[i]}`);
                }
            });

            finalQuery = sql.join(sqlChunks, sql.raw('')) as any; // Cast to avoid type struggle
            const result: any = await this.db.execute(finalQuery as any);
            return result[0]?.insertId || result.insertId;
        } else {
            const result: any = await this.db.execute(sql.raw(query));
            return result[0]?.insertId || result.insertId;
        }
    }

    async executeUpdate(query: string, values: any[]): Promise<void> {
        let finalQuery: any = sql.raw(query);
        if (values && values.length > 0) {
            const chunks = query.split('?');
            const sqlChunks: any[] = [];
            chunks.forEach((chunk, i) => {
                sqlChunks.push(sql.raw(chunk));
                if (i < chunks.length - 1 && i < values.length) {
                    sqlChunks.push(sql`${values[i]}`);
                }
            });
            finalQuery = sql.join(sqlChunks, sql.raw(''));
        }
        await this.db.execute(finalQuery);
    }

    async logMutation(data: any): Promise<void> {
        await this.db.insert(apiMutationLogs).values(data);
    }

    async checkOwnership(query: string, values: any[]): Promise<boolean> {
        let finalQuery: any = sql.raw(query);
        if (values && values.length > 0) {
            const chunks = query.split('?');
            const sqlChunks: any[] = [];
            chunks.forEach((chunk, i) => {
                sqlChunks.push(sql.raw(chunk));
                if (i < chunks.length - 1 && i < values.length) {
                    sqlChunks.push(sql`${values[i]}`);
                }
            });
            finalQuery = sql.join(sqlChunks, sql.raw(''));
        }

        try {
            const result: any = await this.db.execute(finalQuery);
            const rows = result[0] as any[];
            if (!rows || rows.length === 0) return false;
            // logic check handled in SQL or here? 
            // Query was: SELECT owner_id FROM ... WHERE id = ?
            // Repo checkOwnership expects boolean. Service checks `rows[0][DB_COLUMNS.OWNER_ID] === user.id`.
            // Wait, service PASSED a query that selects owner_id.
            // Service expects `this.repo.checkOwnership` to return boolean.
            // The query selects `owner_id`. 
            // `checkOwnership` in service:
            // "return this.repo.checkOwnership(query, [recordId, user.id]);"
            // Wait, the query has ONE placeholder for `id`.
            // But I passed `[recordId, user.id]`.
            // The query logic in Service:
            // `... WHERE id = ?`
            // It selects `owner_id`.
            // So `repo.checkOwnership` must execute query, get `owner_id` from result, and compare with `user.id`.
            // BUT, `user.id` is passed as 2nd value in values array.

            // So:
            const dbOwnerId = rows[0].owner_id;
            const userId = values[1]; // 2nd param
            return dbOwnerId === userId;

        } catch {
            return false;
        }
    }
}
