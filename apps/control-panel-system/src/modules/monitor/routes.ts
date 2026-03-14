
import { Hono, Context } from 'hono';
import { MonitorHonoHandlers, MonitorService } from '@cp/core';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = { monitor: MonitorHonoHandlers };

export const monitorRouter = new Hono<{ Variables: Variables }>();

monitorRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env || !env.DATABASE_URL) return systemNotReady(c);

    try {
        const { createDb } = await import('@modular/database');
        const db = createDb(env.DATABASE_URL);

        const { DrizzleMonitorRepository } = await import('../../repositories/system-core/monitor');

        const repo = new DrizzleMonitorRepository(db);
        const service = new MonitorService(repo);

        c.set('monitor', new MonitorHonoHandlers(service));
    } catch (err: any) {
        console.error('[MONITOR] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandler = (c: Context) => c.get('monitor') as MonitorHonoHandlers;

monitorRouter.get('/', (c) => getHandler(c).getStats(c));
