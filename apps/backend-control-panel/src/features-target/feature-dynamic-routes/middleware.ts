import { Context, Next } from 'hono';
import { buildInternalDatabaseConnection } from '../../features-internal/internal.db';
import { buildTargetDatabaseConnection } from '../target.db';
import { API_STATUS, TARGET_HEADERS, INTERNAL_TABLES } from './constants';
import type { EnvironmentConfig } from '../../env';
import type { AppEnv } from './types';

/**
 * Middleware untuk menginjeksi koneksi database target secara dinamis
 * berdasarkan ID target yang dikirim dari Frontend (x-target-id).
 */
export const injectTargetDatabase = (envConfig: EnvironmentConfig) => {
    return async (c: Context<AppEnv>, next: Next) => {
        // Ambil ID target dari header atau parameter query
        const targetId = c.req.header(TARGET_HEADERS.TARGET_ID) || c.req.query('targetId');
        
        if (!targetId) {
            return c.json({ status: API_STATUS.ERROR, message: `Missing ${TARGET_HEADERS.TARGET_ID} in request headers` }, 400);
        }

        try {
            // 1. Kueri ke database Internal Control Panel untuk mencari URL database target
            const internalDb = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);
            const result: any = await internalDb.execute(`SELECT database_url FROM ${INTERNAL_TABLES.TARGET_SYSTEMS} WHERE id = ?`, [targetId]);
            
            const target = Array.isArray(result) ? result[0] : (result.rows?.[0]);
            
            if (!target || !target.database_url) {
                return c.json({ status: API_STATUS.ERROR, message: 'Target system not found or database not configured' }, 404);
            }

            // 2. Buat koneksi ke database target dan simpan di context
            const targetDb = buildTargetDatabaseConnection(target.database_url);
            c.set('db', targetDb);
            c.set('targetId', targetId);

            await next();
        } catch (error: any) {
            console.error('[DYNAMIC DB MIDDLEWARE] Error connecting to target DB:', error.message);
            return c.json({ status: API_STATUS.ERROR, message: 'Failed to connect to target system database' }, 500);
        }
    };
};
