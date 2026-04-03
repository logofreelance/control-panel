/**
 * target.db.ts
 * 
 * Modul ini HANYA UNTUK KONEKSI KE DATABASE TARGET BACKEND SYSTEM.
 * Tabel yang disentuh: route_dynamic, data_sources, data_source_resources.
 * DILARANG digunakan untuk query data admin_users atau session internal control panel!
 */

import { connect } from '@tidbcloud/serverless';

export type TargetDatabaseConnection = ReturnType<typeof connect>;

export function buildTargetDatabaseConnection(databaseUrl: string): TargetDatabaseConnection {
    if (!databaseUrl) throw new Error("TARGET DB URL MISSING");
    console.log("[DB] Connecting to TARGET_BACKEND_SYSTEM Database...");
    
    // Konversi mysql:// ke https:// untuk TiDB Serverless HTTP driver
    const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
    return connect({ url: httpUrl });
}
