import { Context, Next } from 'hono';
import { buildInternalDatabaseConnection } from '../../features-internal/internal.db';
import { buildTargetDatabaseConnection } from '../target.db';
import { API_STATUS, TARGET_HEADERS, TABLES } from './constants';
import type { EnvironmentConfig } from '../../env';

export type FeatureEnv = {
    Variables: {
        db: any;
        targetId: string;
    }
};

/**
 * Middleware for dynamic target database injection.
 * Self-contained for feature-target-cors.
 */
export const injectTargetDatabase = (envConfig: EnvironmentConfig) => {
    return async (c: Context<FeatureEnv>, next: Next) => {
        const targetId = c.req.header(TARGET_HEADERS.TARGET_ID) || c.req.query('targetId');
        
        if (!targetId) {
            return c.json({ status: API_STATUS.ERROR, message: `Missing ${TARGET_HEADERS.TARGET_ID} in request headers` }, 400);
        }

        try {
            // 1. Find target database URL from internal panel DB
            const internalDb = buildInternalDatabaseConnection(envConfig.DATABASE_URL_INTERNAL_CONTROL_PANEL);
            const result: any = await internalDb.execute(`SELECT database_url FROM ${TABLES.TARGET_SYSTEMS} WHERE id = ?`, [targetId]);
            
            const target = Array.isArray(result) ? result[0] : (result.rows?.[0]);
            
            if (!target || !target.database_url) {
                return c.json({ status: API_STATUS.ERROR, message: 'Target system not found or database not configured' }, 404);
            }

            // 2. Inject target connection
            const targetDb = buildTargetDatabaseConnection(target.database_url);
            c.set('db', targetDb);
            c.set('targetId', targetId);

            await next();
        } catch (error: any) {
            console.error('[CORS MIDDLEWARE] Error:', error.message);
            return c.json({ status: API_STATUS.ERROR, message: 'Failed to connect to target system database' }, 500);
        }
    };
};
