/**
 * router.ts — feature-target-registry
 */
import { Hono } from 'hono';
import { middleware as initAuthMiddleware } from './middleware/handler';
import { handler as listGetHandler } from './list-get/handler';
import { handler as createPostHandler } from './create-post/handler';
import { handler as updatePutHandler } from './update-put/handler';
import { handler as deleteDeleteHandler } from './delete-delete/handler';
import { handler as testConnectionPostHandler } from './test-connection-post/handler';
import { handler as healthCheckPostHandler } from './health-check-post/handler';
import type { EnvironmentConfig } from '../../env';

export function createFeatureTargetRegistry(env: EnvironmentConfig) {
    const router = new Hono<{ Variables: { user: any, session: any, internalDb: any } }>();

    router.use('*', initAuthMiddleware(env));

    router.get('/', listGetHandler);
    router.post('/', createPostHandler);
    router.put('/:id', updatePutHandler);
    router.delete('/:id', deleteDeleteHandler);
    router.post('/test-connection', testConnectionPostHandler);
    router.post('/:id/health', healthCheckPostHandler);

    return router;
}

