/**
 * stats-get/model.ts
 */

import { SQL_QUERIES } from './config';

export async function getCurrentDatabaseName(db: any): Promise<string | null> {
    try {
        const res: any = await db.execute(SQL_QUERIES.GET_DB_NAME);
        const rows = Array.isArray(res) ? res : (res.rows || []);
        return rows.length > 0 ? rows[0]?.db : null;
    } catch (e) {
        console.warn("[STATS-MODEL] getCurrentDatabaseName failed", e);
        return null;
    }
}

export async function getTablesStatsFromInfraSchema(db: any, dbName: string): Promise<any[]> {
    const res: any = await db.execute(SQL_QUERIES.GET_TABLES_INFRA, [dbName]);
    return Array.isArray(res) ? res : (res.rows || []);
}

export async function getTablesStatsFallback(db: any): Promise<any[]> {
    const res: any = await db.execute(SQL_QUERIES.GET_TABLES_FALLBACK);
    return Array.isArray(res) ? res : (res.rows || []);
}
