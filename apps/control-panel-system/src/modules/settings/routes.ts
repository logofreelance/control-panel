import { Hono, Context } from 'hono';
import { SettingsHonoHandlers, SettingsService } from '@cp/settings-manager';
import { DrizzleSettingsRepository } from '../../repositories/system-settings/settings';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = {
    handlers: SettingsHonoHandlers;
};

export const settingsRouter = new Hono<{ Variables: Variables }>();

settingsRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env || !env.DATABASE_URL) return systemNotReady(c);

    try {
        // Full chain: db → repository → service → handlers
        // Direct instantiation of Drizzle Repository
        const repo = new DrizzleSettingsRepository(env.DATABASE_URL);
        const service = new SettingsService(repo);
        const handlers = new SettingsHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[SETTINGS] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: Context) => c.get('handlers') as SettingsHonoHandlers;

// GET / - Get site settings
settingsRouter.get('/', (c) => getHandlers(c).get(c));

// POST / - Update site settings
settingsRouter.post('/', (c) => getHandlers(c).update(c));
