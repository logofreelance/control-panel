/**
 * feature-settings — Entry Point (Block)
 * 
 * 🤖 AI: Creates a self-contained Hono sub-app for Settings.
 * Uses INTERNAL DB (Control Panel's own database).
 * Mounted at `/api/settings` in the main assembler (index.ts).
 * Auto-creates `site_settings` table if it doesn't exist.
 */

import { Hono } from 'hono';
import type { EnvironmentConfig } from '../../env';
import { buildInternalDatabaseConnection } from '../internal.db';
import { setupSettingsRoutes } from './settings.routes';

async function ensureTable(db: any) {
    try {
        await db.execute('CREATE TABLE IF NOT EXISTS site_settings (id VARCHAR(36) PRIMARY KEY, setting_key VARCHAR(100) NOT NULL UNIQUE, setting_value TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
        return true;
    } catch (err: any) {
        console.error('[SETTINGS] ❌ Migration failed:', err?.message || String(err));
        return false;
    }
}

export function createFeatureSettings(env: EnvironmentConfig) {
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

    setupSettingsRoutes(router, db);

    return router as any;
}

