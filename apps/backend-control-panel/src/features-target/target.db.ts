/**
 * target.db.ts
 * 
 * Modul ini HANYA UNTUK KONEKSI KE DATABASE TARGET BACKEND SYSTEM.
 * Tabel yang disentuh: route_dynamic, database_tables, database_resources.
 * DILARANG digunakan untuk query data admin_users atau session internal control panel!
 */

import { connect } from '@tidbcloud/serverless';

export type TargetDatabaseConnection = ReturnType<typeof connect>;

export function buildTargetDatabaseConnection(databaseUrl: string): TargetDatabaseConnection {
    if (!databaseUrl) throw new Error("TARGET DB URL MISSING");
    
    // Konversi mysql:// ke https:// untuk TiDB Serverless HTTP driver
    const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
    return connect({ url: httpUrl });
}

/**
 * executeSafe
 * 
 * Helper untuk mengeksekusi query ke database TARGET secara linear.
 * Menjamin data yang kembali selalu berformat array yang bersih.
 */
export async function executeSafe(db: any, sql: string, params: any[] = []): Promise<any[]> {
    try {
        const res = await db.execute(sql, params);
        if (!res) return [];
        if (Array.isArray(res)) {
            return Array.isArray(res[0]) ? res[0] : res;
        }
        return res.rows || [];
    } catch (error) {
        console.error(`[TARGET_DB_ERROR] SQL: ${sql}`, error);
        throw error;
    }
}
