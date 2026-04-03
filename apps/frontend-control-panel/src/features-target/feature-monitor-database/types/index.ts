/**
 * feature-monitor-database/types/index.ts
 */

export interface TableStat {
    name: string;
    rows: number;
    sizeMb: string;
    indexSizeMb: string;
    overheadMb: string;
}

export interface MonitorDatabaseStats {
    databaseName: string;
    totalSizeMb: string;
    totalRows: number;
    totalTables: number;
    tables: TableStat[];
    summary: {
        largestTable: TableStat;
        mostRowsTable: TableStat;
        indexRatio: string;
        totalIndexSizeMb: string;
    }
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
