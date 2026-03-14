export interface StorageStats {
    databaseName: string;
    totalSizeMb: string;
    totalTables: number;
    totalRows: number;
    tables: TableStat[];
    summary: StorageSummary;
}

export interface StorageSummary {
    largestTable: TableStat | null;
    mostRowsTable: TableStat | null;
    totalIndexSizeMb: string;
    indexRatio: string;
}

export interface TableStat {
    name: string;
    rows: number;
    sizeMb: string;
    indexSizeMb: string;
    overheadMb?: string;
}

export interface SchemaTableResult {
    table_name: string;
    tableName?: string;
    table_rows: string | number;
    rowCount?: string | number;
    data_size_mb: string | number;
    dataSizeMB?: string | number;
    index_size_mb: string | number;
    indexSizeMB?: string | number;
    overhead_mb: string | number;
    overheadMB?: string | number;
    avg_row_length?: string | number;
}

export interface DataSourceResult {
    id: number;
    table_name: string;
    schema_json?: string;
    schemaJson?: string;
    version?: number;
}

export interface ResourceResult {
    id: number;
    name: string;
    data_source_id: number;
}
