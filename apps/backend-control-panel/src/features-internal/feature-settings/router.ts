/**
 * router.ts — feature-settings
 */
import { Hono } from 'hono';
import { middleware as initAuthMiddleware } from './middleware/handler';
import { handler as listGetHandler } from './list-get/handler';
import { handler as updatePutHandler } from './update-put/handler';
import type { EnvironmentConfig } from '../../env';

export function createFeatureSettings(env: EnvironmentConfig) {
    const router = new Hono<{ Variables: { user: any, session: any, internalDb: any } }>();

    router.use('*', initAuthMiddleware(env));

    router.get('/', listGetHandler);
    router.put('/', updatePutHandler);

    return router;
}

