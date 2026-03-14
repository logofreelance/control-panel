import { Context, Next } from 'hono';
import { getEnv, unauthorized, forbidden, serverError, systemNotReady } from './utils';
import { MIDDLEWARE } from './config/labels';
import { IApiKeyRepository, IApiLogRepository } from './types/repository';

/**
 * API GUARD MIDDLEWARE
 * Validates 'x-api-key' header and logs request performance/status.
 */
export const createApiGuard = (getRepo: (c: Context) => IApiKeyRepository & IApiLogRepository) => async (c: Context, next: Next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    const repo = getRepo(c);

    const apiKey = c.req.header('x-api-key');
    if (!apiKey) return unauthorized(c, MIDDLEWARE.ERROR.MISSING_API_KEY);

    const start = Date.now();

    try {
        const keyData = await repo.findByKey(apiKey);

        if (!keyData || !keyData.isActive) {
            return forbidden(c, MIDDLEWARE.ERROR.INVALID_API_KEY);
        }

        // Update last used timestamp (Async, don't block request)
        repo.updateLastUsed(keyData.id).catch(() => { });

        // Store key data for downstream usage (RBAC)
        c.set('keyData', keyData);

        // Continue to actual logic
        await next();

        // Log the request
        const duration = Date.now() - start;
        repo.logRequest({
            apiKeyId: keyData.id,
            endpoint: c.req.path,
            method: c.req.method,
            statusCode: c.res.status,
            durationMs: duration,
            origin: c.req.header('Origin') || null,
            ip: c.req.header('x-forwarded-for') || '127.0.0.1',
            userAgent: c.req.header('User-Agent') || null
        }).catch(() => { });

    } catch (error: any) {
        console.error('API Guard Error:', error);
        return serverError(c, MIDDLEWARE.ERROR.SECURITY_ERROR);
    }
};

/**
 * LEGACY EXPORT: API Guard middleware (no-op without repository)
 * Use createApiGuard factory for full functionality
 * @deprecated Use createApiGuard instead
 */
export const apiGuard = async (c: Context, next: Next) => {
    console.warn('[DEPRECATED] apiGuard without repository. Use createApiGuard factory.');
    return next();
};
