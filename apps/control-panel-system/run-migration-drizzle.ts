/**
 * run-migration-drizzle.ts — Run database migrations via Drizzle
 */
import { config } from 'dotenv';
import * as path from 'path';
config({ path: path.resolve(__dirname, '.env') });

import { createDb } from '@modular/database';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const db = createDb(DATABASE_URL);

async function runMigrations() {
    console.log('[MIGRATE] Running migrations via Drizzle DB instance...');
    
    // 1. Add config_version to site_settings (safe)
    try {
        await db.execute('ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS config_version int DEFAULT 1;');
        console.log('[MIGRATE] Added config_version to site_settings');
    } catch (err: any) {
        if (!err?.message?.includes('Duplicate column')) {
            console.error('[MIGRATE] ERROR adding config_version:', err?.message);
        } else {
            console.log('[MIGRATE] config_version already exists.');
        }
    }

    // 2. Create node_health_metrics table
    try {
        await db.execute(`
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
        `);
        console.log('[MIGRATE] Created node_health_metrics table');
    } catch (err: any) {
        console.error('[MIGRATE] ERROR creating node_health_metrics:', err?.message);
    }

    console.log('[MIGRATE] Verifying...');
    try {
        const result = await db.execute('SHOW COLUMNS FROM site_settings');
        console.log('Columns in site_settings:', result.rows ? result.rows.map((r: any) => r.Field) : result.map((r: any) => r.Field));
    } catch (e: any) {
        console.error('Verify error:', e.message);
    }
}

runMigrations().catch(err => {
    console.error('[MIGRATE] Fatal error:', err);
    process.exit(1);
});
