/**
 * migrate.ts — Run database migrations via TiDB HTTP driver
 * Execute: npx tsx migrate.ts
 */
import { config } from 'dotenv';
import * as path from 'path';
config({ path: path.resolve(__dirname, '.env') });

import { connect } from '@tidbcloud/serverless';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('[MIGRATE] DATABASE_URL is not set');
    process.exit(1);
}

const MIGRATION_SQL = `
-- 1. Add config_version to site_settings (safe: IF NOT EXISTS workaround)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS config_version int DEFAULT 1;

-- 2. Create node_health_metrics table for Service Discovery & Monitoring
CREATE TABLE IF NOT EXISTS node_health_metrics (
    id serial NOT NULL AUTO_INCREMENT,
    node_id varchar(255) NOT NULL,
    endpoint_url varchar(255) NOT NULL,
    cpu_usage varchar(50),
    memory_usage varchar(50),
    uptime int,
    status varchar(50) DEFAULT 'online',
    last_heartbeat timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    created_at timestamp DEFAULT (now()),
    CONSTRAINT node_health_metrics_id PRIMARY KEY(id),
    CONSTRAINT node_health_metrics_node_id_unique UNIQUE(node_id)
);
`;

async function runMigrations() {
    console.log('[MIGRATE] Connecting to TiDB Cloud...');
    const conn = connect({ url: DATABASE_URL });

    // Split on the comment lines
    const statements = MIGRATION_SQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
        try {
            console.log(`[MIGRATE] Running: ${stmt.slice(0, 80)}...`);
            await conn.execute(stmt);
            console.log('[MIGRATE] ✓ OK');
        } catch (err: any) {
            const isAlreadyExists = err?.message?.includes('already exists');
            const isDuplicate = err?.message?.includes('Duplicate column');
            if (isAlreadyExists || isDuplicate) {
                console.log('[MIGRATE] ✓ Already exists, skipping');
            } else {
                console.error('[MIGRATE] ✗ Error:', err?.message);
            }
        }
    }

    console.log('[MIGRATE] Migration complete!');
}

runMigrations().catch(err => {
    console.error('[MIGRATE] Fatal error:', err);
    process.exit(1);
});
