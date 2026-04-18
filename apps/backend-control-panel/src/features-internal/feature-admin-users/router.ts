/**
 * router.ts — feature-admin-users
 */
import { Hono } from 'hono';
import { middleware as initAuthMiddleware } from './middleware/handler';
import { handler as listGetHandler } from './list-get/handler';
import { handler as createPostHandler } from './create-post/handler';
import { handler as deleteDeleteHandler } from './delete-delete/handler';
import type { EnvironmentConfig } from '../../env';

export function createFeatureAdminUsers(env: EnvironmentConfig) {
    const router = new Hono<{ Variables: { user: any, session: any, internalDb: any } }>();

    // 1. Auth Guard & DB Injection
    router.use('*', initAuthMiddleware(env));

    // 2. Register Routes
    router.get('/', listGetHandler);
    router.post('/', createPostHandler);
    router.delete('/:id', deleteDeleteHandler);

    return router;
}

