// modules/cors/routes.ts
import { Hono, Context } from 'hono';
import { CorsHonoHandlers, CorsService } from '@cp/api-manager';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = {
    handlers: CorsHonoHandlers;
};

export const corsRouter = new Hono<{ Variables: Variables }>();

corsRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    try {
        const { createDb } = await import('@modular/database');
        const db = createDb(env.DATABASE_URL);

        // Direct instantiation
        const { DrizzleCorsRepository } = await import('../../repositories/system-api/cors');
        const repo = new DrizzleCorsRepository(db);
        const service = new CorsService(repo);
        const handlers = new CorsHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[CORS] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: Context) => c.get('handlers') as CorsHonoHandlers;

corsRouter.get('/', (c) => getHandlers(c).list(c));
corsRouter.post('/', (c) => getHandlers(c).create(c));
corsRouter.delete('/:id', (c) => getHandlers(c).delete(c));
corsRouter.put('/:id/toggle', (c) => getHandlers(c).toggle(c));
