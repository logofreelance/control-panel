// modules/roles/routes.ts
import { Hono, Context } from 'hono';
import { RolesHonoHandlers, RolesService } from '@cp/user-manager';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = { handlers: RolesHonoHandlers };

export const rolesRouter = new Hono<{ Variables: Variables }>();

rolesRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    try {
        // Direct instantiation - Workers compatible
        const { DrizzleRolesRepository } = await import('../../repositories/system-users/roles');
        const repo = new DrizzleRolesRepository(env.DATABASE_URL);
        const service = new RolesService(repo);
        const handlers = new RolesHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[ROLES] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: Context) => c.get('handlers') as RolesHonoHandlers;

rolesRouter.get('/', (c) => getHandlers(c).list(c));
rolesRouter.get('/:id', (c) => getHandlers(c).get(c));
rolesRouter.post('/', (c) => getHandlers(c).create(c));
rolesRouter.put('/:id', (c) => getHandlers(c).update(c));
rolesRouter.delete('/:id', (c) => getHandlers(c).delete(c));
rolesRouter.get('/check-super/:roleName', (c) => getHandlers(c).checkSuper(c));
