// modules/users/routes.ts
import { Hono, Context } from 'hono';
import { UsersHonoHandlers, UsersService } from '@cp/user-manager';
import { createDb, UserRepository } from '@modular/database';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = {
    handlers: UsersHonoHandlers;
};

export const usersRouter = new Hono<{ Variables: Variables }>();

// Middleware to inject handlers
usersRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    try {
        // Full chain: db → repository → service → handlers
        const db = createDb(env.DATABASE_URL);
        const repo = new UserRepository(db);
        const service = new UsersService(repo);
        const handlers = new UsersHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[USERS] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: Context) => c.get('handlers') as UsersHonoHandlers;

// Users CRUD
usersRouter.get('/', (c) => getHandlers(c).list(c));
usersRouter.get('/:id', (c) => getHandlers(c).get(c));
usersRouter.post('/', (c) => getHandlers(c).create(c));
usersRouter.put('/:id', (c) => getHandlers(c).update(c));
usersRouter.delete('/:id', (c) => getHandlers(c).delete(c));
