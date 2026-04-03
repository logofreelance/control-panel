/**
 * feature-target-registry — Entry Point (Block)
 * 
 * 🤖 AI: Creates a self-contained Hono sub-app for Target System registration.
 * Uses INTERNAL DB (Control Panel's own database).
 * Mounted at `/api/target-systems` in the main assembler (index.ts).
 * Auto-creates `target_systems` table if it doesn't exist.
 */

import { Hono } from 'hono';
import type { EnvironmentConfig } from '../../env';
import { buildInternalDatabaseConnection } from '../internal.db';
import { setupTargetRegistryRoutes } from './target-registry.routes';

async function ensureTable(db: any) {
    try {
        await db.execute('CREATE TABLE IF NOT EXISTS target_systems (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, description TEXT, api_endpoint VARCHAR(500), database_url VARCHAR(1000) NOT NULL, status VARCHAR(20) DEFAULT \'unknown\', route_count INT DEFAULT 0, last_health_check TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
        
        // Migrate existing tables: add route_count column if missing
        try {
            await db.execute('ALTER TABLE target_systems ADD COLUMN route_count INT DEFAULT 0');
        } catch { /* Column already exists — ignore */ }

        console.log('[TARGET-REGISTRY] ✅ target_systems table ready');
        return true;
    } catch (err: any) {
        console.error('[TARGET-REGISTRY] ❌ Migration failed:', err?.message || String(err));
        return false;
    }
}

export function createFeatureTargetRegistry(env: EnvironmentConfig) {
    const db = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
    const router = new Hono();

    // Auto-migrate on first request
    let migrated = false;
    router.use('*', async (c, next) => {
        if (!migrated) {
            migrated = await ensureTable(db);
        }
        return next();
    });

    setupTargetRegistryRoutes(router, db);

    return router as any;
}
