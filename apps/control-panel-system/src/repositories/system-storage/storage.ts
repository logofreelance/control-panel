import { createDb, sql } from '@modular/database';
import { IStorageRepository, StorageStats, TableStat, SchemaTableResult, DataSourceResult, ResourceResult, STORAGE_LABELS, STORAGE_SYSTEM } from '@cp/storage-manager';

export class DrizzleStorageRepository implements IStorageRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    private normalizeRows<T>(result: unknown): T[] {
        if (Array.isArray(result)) {
            if (result.length > 0 && Array.isArray(result[0])) {
                return result[0] as T[];
            }
            return result as T[];
        }
        if (typeof result === 'object' && result !== null && 'rows' in result) {
            return (result as { rows: T[] }).rows;
        }
        return [];
    }

    async getStats(dbName: string): Promise<StorageStats> {
        const result = await this.db.execute(sql`
            SELECT 
                table_name,
                table_rows,
                ROUND((data_length / 1024 / 1024), 2) AS data_size_mb,
                ROUND((index_length / 1024 / 1024), 2) AS index_size_mb,
                ROUND((data_free / 1024 / 1024), 2) AS overhead_mb,
                avg_row_length
            FROM information_schema.TABLES 
            WHERE table_schema = ${dbName}
            ORDER BY (data_length + index_length) DESC
        `);

        const rows = this.normalizeRows<SchemaTableResult>(result);

        const tables: TableStat[] = rows.map((row) => ({
            name: row.table_name || row.tableName || '',
            rows: Number(row.table_rows || row.rowCount || 0),
            sizeMb: Number(row.data_size_mb || row.dataSizeMB || 0).toFixed(2),
            indexSizeMb: Number(row.index_size_mb || row.indexSizeMB || 0).toFixed(2),
            overheadMb: Number(row.overhead_mb || row.overheadMB || 0).toFixed(2),
        }));

        const totalRows = tables.reduce((acc, t) => acc + t.rows, 0);
        const totalSize = tables.reduce((acc, t) => acc + Number(t.sizeMb) + Number(t.indexSizeMb), 0);
        const totalIndexSize = tables.reduce((acc, t) => acc + Number(t.indexSizeMb), 0);
        const totalDataSize = tables.reduce((acc, t) => acc + Number(t.sizeMb), 0);

        const sortedBySize = [...tables].sort((a, b) => Number(b.sizeMb) - Number(a.sizeMb));
        const sortedByRows = [...tables].sort((a, b) => b.rows - a.rows);

        const indexRatio = totalDataSize > 0
            ? ((totalIndexSize / totalDataSize) * 100).toFixed(0)
            : STORAGE_SYSTEM.DEFAULTS.ZERO_STRING;

        return {
            databaseName: dbName,
            totalSizeMb: totalSize.toFixed(2),
            totalTables: tables.length,
            totalRows,
            tables,
            summary: {
                largestTable: sortedBySize[0] || null,
                mostRowsTable: sortedByRows[0] || null,
                totalIndexSizeMb: totalIndexSize.toFixed(2),
                indexRatio
            }
        };
    }

    async dropTable(dbName: string, tableName: string): Promise<boolean> {
        const tableCheck = await this.db.execute(sql`
            SELECT table_name 
            FROM information_schema.TABLES 
            WHERE table_schema = ${dbName} AND table_name = ${tableName}
        `);

        const rows = this.normalizeRows<{ table_name: string }>(tableCheck);
        if (rows.length === 0) return false;

        await this.db.execute(sql.raw(`DROP TABLE IF EXISTS \`${tableName}\``));

        try {
            await this.db.execute(sql`DELETE FROM data_source_resources WHERE data_source_id IN (SELECT id FROM data_sources WHERE table_name = ${tableName})`);
            await this.db.execute(sql`DELETE FROM data_source_migrations WHERE data_source_id IN (SELECT id FROM data_sources WHERE table_name = ${tableName})`);
            await this.db.execute(sql`DELETE FROM data_sources WHERE table_name = ${tableName}`);
        } catch (e: unknown) {
            console.warn(STORAGE_LABELS.logs.cleanupDataSource, e);
        }

        try {
            const allDsCheck = await this.db.execute(sql`SELECT id, schema_json, version FROM data_sources`);
            const allDs = this.normalizeRows<DataSourceResult>(allDsCheck);

            for (const ds of allDs) {
                const schemaJson = ds.schema_json || ds.schemaJson;
                if (!schemaJson) continue;

                try {
                    const schema = JSON.parse(schemaJson);
                    const originalLength = schema.columns?.length || 0;

                    if (schema.columns) {
                        schema.columns = schema.columns.filter((col: any) => col.target !== tableName);
                    }

                    if ((schema.columns?.length || 0) !== originalLength) {
                        const newVersion = (ds.version || 1) + 1;
                        await this.db.execute(sql`
                            UPDATE data_sources 
                            SET schema_json = ${JSON.stringify(schema)}, version = ${newVersion}
                            WHERE id = ${ds.id}
                        `);
                    }
                } catch { }
            }
        } catch (e: unknown) {
            console.warn(STORAGE_LABELS.logs.cleanupWarning, e);
        }

        return true;
    }

    async cleanupOrphaned(dbName: string): Promise<{ orphanedDataSources: number; orphanedResources: number; invalidRelations: number; details: string[] }> {
        const details: string[] = [];
        let orphanedDataSources = 0;
        let orphanedResources = 0;
        const invalidRelations = 0;

        const dsCheck = await this.db.execute(sql`
            SELECT ds.id, ds.table_name 
            FROM data_sources ds
            LEFT JOIN information_schema.TABLES t 
            ON ds.table_name = t.table_name AND t.table_schema = ${dbName}
            WHERE t.table_name IS NULL
        `);

        const dsRows = this.normalizeRows<DataSourceResult>(dsCheck);

        for (const row of dsRows) {
            orphanedDataSources++;
            details.push(`${STORAGE_LABELS.logs.cleanupDataSource}: ${row.table_name}`);
            await this.db.execute(sql`DELETE FROM data_source_resources WHERE data_source_id = ${row.id}`);
            await this.db.execute(sql`DELETE FROM data_sources WHERE id = ${row.id}`);
        }

        const resCheck = await this.db.execute(sql`
            SELECT r.id, r.name 
            FROM data_source_resources r
            LEFT JOIN data_sources ds ON r.data_source_id = ds.id
            WHERE ds.id IS NULL
        `);

        const resRows = this.normalizeRows<ResourceResult>(resCheck);

        for (const row of resRows) {
            orphanedResources++;
            details.push(`${STORAGE_LABELS.logs.cleanupResource}: ${row.name}`);
            await this.db.execute(sql`DELETE FROM data_source_resources WHERE id = ${row.id}`);
        }

        return { orphanedDataSources, orphanedResources, invalidRelations, details };
    }
}
