// modules/api-keys/routes.ts
import { Hono, Context } from 'hono';
import { ApiKeysHonoHandlers, ApiKeysService } from '@cp/api-manager';
import { createDb } from '@modular/database';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = {
    handlers: ApiKeysHonoHandlers;
};

export const apiKeysRouter = new Hono<{ Variables: Variables }>();

apiKeysRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    try {
        // Full chain: db → repository → service → handlers
        const db = createDb(env.DATABASE_URL);

        const { DrizzleApiKeysRepository } = await import('../../repositories/system-api/api-keys');
        const repo = new DrizzleApiKeysRepository(db);

        const service = new ApiKeysService(repo);
        const handlers = new ApiKeysHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[API-KEYS] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: Context) => c.get('handlers') as ApiKeysHonoHandlers;

apiKeysRouter.get('/', (c) => getHandlers(c).list(c));
apiKeysRouter.post('/', (c) => getHandlers(c).create(c));
apiKeysRouter.delete('/:id', (c) => getHandlers(c).delete(c));
apiKeysRouter.put('/:id/toggle', (c) => getHandlers(c).toggle(c));
