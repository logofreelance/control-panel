/**
 * debug-env.ts — Debug DATABASE_URL and connection
 */
import { config } from 'dotenv';
import * as path from 'path';
config({ path: path.resolve(__dirname, '.env') });

import { connect } from '@tidbcloud/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
console.log('[DEBUG] DATABASE_URL:', DATABASE_URL ? `${DATABASE_URL.substring(0, 30)}...` : 'NOT SET');

async function run() {
    if (!DATABASE_URL) return;
    const conn = connect({ url: DATABASE_URL });
    const result = await conn.execute('SELECT DATABASE() as db, USER() as user');
    console.log('[DEBUG] Connected as:', result.rows);
    const tables = await conn.execute("SHOW TABLES");
    console.log('[DEBUG] Tables:', tables.rows?.map((r: any) => Object.values(r)[0]));
}

run().catch(console.error);
