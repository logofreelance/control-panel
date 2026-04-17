/**
 * stats-get/logic.ts
 */

import { TableMetric, DatabaseStats } from './types';
import * as model from './model';

export async function getDatabaseMetrics(db: any): Promise<DatabaseStats> {
    const dbName = await model.getCurrentDatabaseName(db) || 'unknown';
    
    let rawTables: any[];
    let usingFallback = false;
    
    try {
        rawTables = await model.getTablesStatsFromInfraSchema(db, dbName);
    } catch (e) {
        console.warn("[STATS-LOGIC] Infra schema failed, fallback to SHOW TABLE STATUS", e);
        rawTables = await model.getTablesStatsFallback(db);
        usingFallback = true;
    }

    const formattedTables: TableMetric[] = rawTables.map((t: any) => {
        if (usingFallback) {
            return {
                name: t.Name || t.name,
                rows: Number(t.Rows || t.rows || 0),
                sizeMb: ((t.Data_length || 0) / 1024 / 1024).toFixed(2),
                indexSizeMb: ((t.Index_length || 0) / 1024 / 1024).toFixed(2),
                overheadMb: ((t.Data_free || 0) / 1024 / 1024).toFixed(2)
            };
        }
        return {
            name: t.name,
            rows: Number(t.rowCount || t.rows || 0),
            sizeMb: ((t.dataBytes || 0) / 1024 / 1024).toFixed(2),
            indexSizeMb: ((t.indexBytes || 0) / 1024 / 1024).toFixed(2),
            overheadMb: ((t.freeBytes || 0) / 1024 / 1024).toFixed(2)
        };
    });

    const totalSizeMb = formattedTables.reduce((acc, t) => acc + Number(t.sizeMb) + Number(t.indexSizeMb), 0).toFixed(2);
    const totalRows = formattedTables.reduce((acc, t) => acc + t.rows, 0);

    return {
        databaseName: dbName,
        totalSizeMb,
        totalRows,
        totalTables: formattedTables.length,
        tables: formattedTables
    };
}
