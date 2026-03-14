/**
 * Quick migration script for TiDB Cloud via HTTP driver
 * Execute: npx tsx run-migration.ts
 */
import { config } from 'dotenv';
import * as path from 'path';
config({ path: path.resolve(__dirname, '.env') });

import { connect } from '@tidbcloud/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('[MIGRATE] DATABASE_URL is not set');
    process.exit(1);
}

const conn = connect({ url: DATABASE_URL });

async function run() {
    // 1. Add config_version column
    try {
        console.log('[MIGRATE] Adding config_version column...');
        await conn.execute('ALTER TABLE site_settings ADD COLUMN config_version int DEFAULT 1');
        console.log('[MIGRATE] ✓ config_version added');
    } catch (err: any) {
        if (err?.message?.includes('Duplicate column')) {
            console.log('[MIGRATE] ✓ config_version already exists');
        } else {
            console.error('[MIGRATE] ✗', err?.message);
        }
    }

    // 2. Create node_health_metrics table
    try {
        console.log('[MIGRATE] Creating node_health_metrics table...');
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS node_health_metrics (
                id bigint NOT NULL AUTO_INCREMENT,
                node_id varchar(255) NOT NULL,
                endpoint_url varchar(255) NOT NULL,
                cpu_usage varchar(50),
                memory_usage varchar(50),
                uptime int,
                status varchar(50) DEFAULT 'online',
                last_heartbeat timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY node_health_metrics_node_id_unique (node_id)
            )
        `);
        console.log('[MIGRATE] ✓ node_health_metrics created');
    } catch (err: any) {
        if (err?.message?.includes('already exists')) {
            console.log('[MIGRATE] ✓ node_health_metrics already exists');
        } else {
            console.error('[MIGRATE] ✗', err?.message);
        }
    }

    console.log('[MIGRATE] Done!');
}

run().catch(err => {
    console.error('[MIGRATE] Fatal:', err);
    process.exit(1);
});
