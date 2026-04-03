/**
 * check-schema.ts — Verify migration was applied
 * Execute: npx tsx check-schema.ts
 */
import { config } from 'dotenv';
import * as path from 'path';
config({ path: path.resolve(__dirname, '.env') });

import { connect } from '@tidbcloud/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

async function check() {
    const conn = connect({ url: DATABASE_URL });

    console.log('\n=== Checking site_settings columns ===');
    const cols = await conn.execute('SHOW COLUMNS FROM site_settings');
    console.log(cols.rows);

    console.log('\n=== Checking node_health_metrics table ===');
    try {
        const tbl = await conn.execute('SHOW COLUMNS FROM node_health_metrics');
        console.log(tbl.rows);
    } catch (e: any) {
        console.log('Table does not exist:', e.message);
    }
}

check().catch(console.error);
