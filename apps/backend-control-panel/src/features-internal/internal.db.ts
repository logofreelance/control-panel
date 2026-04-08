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
