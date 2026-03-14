import { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { getEnv, isProd } from './utils';
import { MIDDLEWARE_SYSTEM } from './config/constants';
import { ICorsRepository } from './types/repository';
import { MIDDLEWARE } from './config/labels';

// CORS configuration
const CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'] as const;
const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'x-api-key', 'x-csrf-token'] as const;
const CORS = { CREDENTIALS: true } as const;
const SECURITY_LIMITS = { CORS_CACHE_TTL_MS: 5 * 60 * 1000 } as const;

// ============================================
// CORS CACHE
// ============================================

interface CacheEntry {
    allowed: boolean;
    expires: number;
}

// In-memory cache for CORS domains
const corsCache = new Map<string, CacheEntry>();

/**
 * Check if origin is cached
 */
function getCachedOrigin(origin: string): boolean | null {
    const entry = corsCache.get(origin);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expires) {
        corsCache.delete(origin);
        return null;
    }

    return entry.allowed;
}

/**
 * Cache an origin result
 */
function cacheOrigin(origin: string, allowed: boolean): void {
    corsCache.set(origin, {
        allowed,
        expires: Date.now() + SECURITY_LIMITS.CORS_CACHE_TTL_MS,
    });
}

/**
 * Clear the CORS cache (can be called when domains are updated)
 */
export function clearCorsCache(): void {
    corsCache.clear();
}

// ============================================
// DYNAMIC CORS MIDDLEWARE
// ============================================

/**
 * DYNAMIC CORS MIDDLEWARE FACTORY
 * Fetches allowed origins from the repository for secure cross-origin requests.
 * Results are cached to avoid database query on every request.
 */
export const createDynamicCors = (getRepo: (c: Context) => ICorsRepository) => async (c: Context, next: Next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return next();

    // Verify getter returns repo
    const repo = getRepo(c);
    if (!repo) return next();

    try {
        const origin = c.req.header('Origin');
        if (!origin) return next();

        // Check cache first
        const cachedResult = getCachedOrigin(origin);
        if (cachedResult !== null) {
            if (cachedResult) {
                const corsMiddleware = cors({
                    origin: origin,
                    allowMethods: [...CORS_METHODS],
                    allowHeaders: [...ALLOWED_HEADERS],
                    credentials: CORS.CREDENTIALS,
                });
                return corsMiddleware(c, next);
            }
            // Not allowed, continue without CORS headers
            return next();
        }

        // Query repository
        const domains = await repo.findActiveDomains();

        let isAllowed = false;

        // Check exact match or wildcard
        const exactMatch = domains.some((d: { domain: string }) => d.domain === origin);
        const wildcard = domains.some((d: { domain: string }) => d.domain === '*');

        if (isProd()) {
            // Production: Strict check (no wildcard unless explicitly desired, but usually strict)
            isAllowed = exactMatch && origin !== '*';
        } else {
            // Dev: Allow wildcard, warn if wildcard used
            isAllowed = exactMatch || wildcard;
            if (wildcard) {
                console.warn(MIDDLEWARE.LOG.SECURITY_WILDCARD_WARNING);
            }
        }

        cacheOrigin(origin, isAllowed);

        if (isAllowed) {
            const corsMiddleware = cors({
                origin: origin,
                allowMethods: [...CORS_METHODS],
                allowHeaders: [...ALLOWED_HEADERS],
                credentials: CORS.CREDENTIALS,
            });
            return corsMiddleware(c, next);
        } else if (isProd()) {
            console.warn(MIDDLEWARE.LOG.SECURITY_CORS_REJECTED, origin);
        }

        return next(); // Continue without CORS headers

    } catch (error) {
        console.error(MIDDLEWARE.LOG.CORS_DB_ERROR, error);
        // On error, don't cache and continue without CORS
    }

    return next();
};

/**
 * LEGACY EXPORT: Dynamic CORS middleware (no-op without repository)
 * Use createDynamicCors factory for full functionality
 * @deprecated Use createDynamicCors instead
 */
export const dynamicCors = async (c: Context, next: Next) => {
    console.warn('[DEPRECATED] dynamicCors without repository. Use createDynamicCors factory.');
    return next();
};
