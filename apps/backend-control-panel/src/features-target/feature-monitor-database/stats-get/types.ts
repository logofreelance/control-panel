/**
 * stats-get/types.ts
 */

export interface TableMetric {
    name: string;
    rows: number;
    sizeMb: string;
    indexSizeMb: string;
    overheadMb: string;
}

export interface DatabaseStats {
    databaseName: string;
    totalSizeMb: string;
    totalRows: number;
    totalTables: number;
    tables: TableMetric[];
}
