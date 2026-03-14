// modules/permissions/routes.ts
import { Hono, Context } from 'hono';
import { PermissionsHonoHandlers, PermissionsService } from '@cp/user-manager';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = {
    handlers: PermissionsHonoHandlers;
};

export const permissionsRouter = new Hono<{ Variables: Variables }>();

permissionsRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    try {
        // Direct instantiation - Workers compatible
        // Import locally to avoid top-level dependency issues if needed, or import at top
        const { DrizzlePermissionsRepository } = await import('../../repositories/system-users/permissions');
        const repo = new DrizzlePermissionsRepository(env.DATABASE_URL);
        const service = new PermissionsService(repo);
        const handlers = new PermissionsHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[PERMISSIONS] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: Context) => c.get('handlers') as PermissionsHonoHandlers;

permissionsRouter.get('/', (c) => getHandlers(c).list(c));
permissionsRouter.get('/:id', (c) => getHandlers(c).get(c));
permissionsRouter.post('/', (c) => getHandlers(c).create(c));
permissionsRouter.put('/:id', (c) => getHandlers(c).update(c));
permissionsRouter.delete('/:id', (c) => getHandlers(c).delete(c));
permissionsRouter.get('/role/:roleName', (c) => getHandlers(c).getRolePermissions(c));
permissionsRouter.put('/role/:roleName', (c) => getHandlers(c).updateRolePermissions(c));
