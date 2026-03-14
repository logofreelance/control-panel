import { Context, Next } from 'hono';
import { IApiLogRepository } from './types/repository';
import { MIDDLEWARE } from './config/labels';

export const createRequestLogger = (getRepo: (c: Context) => IApiLogRepository) => async (c: Context, next: Next) => {
    const start = Date.now();
    const repo = getRepo(c);

    try {
        await next();

        const duration = Date.now() - start;

        repo.logRequest({
            apiKeyId: null,
            endpoint: c.req.path,
            method: c.req.method,
            statusCode: c.res.status,
            durationMs: duration,
            origin: c.req.header('Origin') || null,
            ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1',
            userAgent: c.req.header('User-Agent') || null
        }).catch(err => {
            console.error(MIDDLEWARE.LOG.REQUEST_LOGGING_FAILED, err.message);
        });

    } catch (error) {
        const duration = Date.now() - start;
        repo.logRequest({
            apiKeyId: null,
            endpoint: c.req.path,
            method: c.req.method,
            statusCode: 500,
            durationMs: duration,
            origin: c.req.header('Origin') || null,
            ip: c.req.header('x-forwarded-for') || '127.0.0.1',
            userAgent: c.req.header('User-Agent') || null
        }).catch(() => { });
        throw error;
    }
};

/**
 * LEGACY EXPORT: Request Logger middleware (no-op without repository)
 * Use createRequestLogger factory for full functionality
 * @deprecated Use createRequestLogger instead
 */
export const requestLogger = async (c: Context, next: Next) => {
    console.warn('[DEPRECATED] requestLogger without repository. Use createRequestLogger factory.');
    return next();
};
