
import { Hono, Context } from 'hono';
import { ErrorTemplateHonoHandlers, ErrorTemplateService } from '@cp/core'; // Import Service directly
import { getEnv, systemNotReady } from '@cp/config';
import { getContainer } from '../../container';
import { TOKENS, IErrorTemplateService } from '@modular/contracts';

type Variables = { templates: ErrorTemplateHonoHandlers };

export const errorTemplatesRouter = new Hono<{ Variables: Variables }>();

errorTemplatesRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env || !env.DATABASE_URL) return systemNotReady(c);

    try {
        const { createDb } = await import('@modular/database');
        const db = createDb(env.DATABASE_URL);
        const { DrizzleErrorTemplateRepository } = await import('../../repositories/system-core/error-templates');

        const repo = new DrizzleErrorTemplateRepository(db);
        const service = new ErrorTemplateService(repo);
        c.set('templates', new ErrorTemplateHonoHandlers(service));
    } catch (err: any) {
        console.error('[ORANGE] CRITICAL SERVICE ERROR:', err);
        return c.json({
            status: 'error',
            message: 'Service Instantiation Failed',
            error: err.message || String(err),
            stack: err.stack
        }, 500);
    }
    await next();
});

const getHandler = (c: Context) => c.get('templates') as ErrorTemplateHonoHandlers;

errorTemplatesRouter.get('/', (c) => getHandler(c).list(c));
errorTemplatesRouter.get('/global', (c) => getHandler(c).getGlobal(c));
errorTemplatesRouter.get('/resolve/:statusCode', (c) => getHandler(c).resolve(c));
errorTemplatesRouter.post('/', (c) => getHandler(c).save(c));
errorTemplatesRouter.delete('/:id', (c) => getHandler(c).delete(c));
