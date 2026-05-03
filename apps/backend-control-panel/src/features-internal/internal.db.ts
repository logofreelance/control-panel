/**
 * internal.db.ts
 * 
 * Modul ini HANYA UNTUK KONEKSI KE DATABASE CONTROL PANEL INTERNAL.
 * Tabel yang disentuh: admin_users, admin_sessions, panel_settings.
 * DILARANG digunakan untuk query data dynamic_routes atau sistem backend target!
 */

import { connect } from '@tidbcloud/serverless';

export type InternalDatabaseConnection = ReturnType<typeof connect>;

export function buildInternalDatabaseConnection(databaseUrl: string): InternalDatabaseConnection {
    if (!databaseUrl) throw new Error("INTERNAL DB URL MISSING");
    
    // Konversi mysql:// ke https:// untuk TiDB Serverless HTTP driver
    const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
    return connect({ url: httpUrl });
}

/**
 * executeSafe
 * 
 * Helper untuk mengeksekusi query secara linear dan mengembalikan data yang PASTI.
 * Menghilangkan keharusan mengecek Array.isArray() berkali-kali di level aplikasi.
 */
export async function executeSafe(db: any, sql: string, params: any[] = []): Promise<any[]> {
    try {
        const res = await db.execute(sql, params);
        // Standarisasi: Selalu kembalikan array baris data yang bersih
        if (!res) return [];
        if (Array.isArray(res)) {
            return Array.isArray(res[0]) ? res[0] : res;
        }
        return res.rows || [];
    } catch (error) {
        console.error(`[DB_ERROR] SQL: ${sql}`, error);
        throw error; // Re-throw agar ditangkap oleh global error handler
    }
}
