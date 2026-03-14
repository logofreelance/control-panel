/**
 * backend/src/middleware/rate-limiter.ts
 * 
 * Rate limiting middleware for Hono
 * Uses in-memory store with sliding window algorithm
 */

import { Context, Next } from 'hono';
import { MIDDLEWARE_SYSTEM } from './config/constants';
import { MIDDLEWARE } from './config/labels';

const { RATE_LIMITS, HEADERS } = MIDDLEWARE_SYSTEM;

// ============================================
// LOCAL HELPERS (Moved from @cp/config to avoid React dependency)
// ============================================

/**
 * Extract client IP from request headers
 */
function getClientIp(headers: {
    get(name: string): string | undefined;
}): string {
    // Check for CF-Connecting-IP first (Cloudflare specific)
    const cfIp = headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    return '127.0.0.1';
}

/**
 * Log a security event
 */
function logSecurityEvent(
    event: string,
    details: Record<string, unknown>
): void {
    const timestamp = new Date().toISOString();
    console.warn(`[SECURITY] [${timestamp}] ${event}:`, JSON.stringify(details));
}

// ============================================
// RATE LIMITER STORE
// ============================================

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries lazily (on each request check)
// Note: setInterval is not allowed in Cloudflare Workers global scope
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}

// ============================================
// RATE LIMITER FUNCTIONS
// ============================================

/**
 * Check if request is rate limited
 */
function isRateLimited(
    key: string,
    maxRequests: number,
    windowMs: number
): { limited: boolean; remaining: number; resetAt: number } {
    // Lazy cleanup of expired entries
    cleanupExpiredEntries();

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // No entry or expired - create new
    if (!entry || entry.resetAt < now) {
        const resetAt = now + windowMs;
        rateLimitStore.set(key, { count: 1, resetAt });
        return { limited: false, remaining: maxRequests - 1, resetAt };
    }

    // Increment count
    entry.count++;

    if (entry.count > maxRequests) {
        return { limited: true, remaining: 0, resetAt: entry.resetAt };
    }

    return { limited: false, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ============================================
// MIDDLEWARE FACTORIES
// ============================================

/**
 * Create a rate limiter middleware with custom options
 */
export function createRateLimiter(options: {
    windowMs: number;
    maxRequests: number;
    keyPrefix?: string;
    message?: string;
}) {
    const { windowMs, maxRequests, keyPrefix = 'rl', message = MIDDLEWARE.ERROR.TOO_MANY_REQUESTS } = options;

    return async (c: Context, next: Next) => {
        const ip = getClientIp(c.req.raw.headers as unknown as { get(name: string): string | undefined });
        const key = `${keyPrefix}:${ip}`;

        const { limited, remaining, resetAt } = isRateLimited(key, maxRequests, windowMs);

        // Set rate limit headers
        c.header(HEADERS.X_RATE_LIMIT_LIMIT, String(maxRequests));
        c.header(HEADERS.X_RATE_LIMIT_REMAINING, String(remaining));
        c.header(HEADERS.X_RATE_LIMIT_RESET, String(Math.ceil(resetAt / 1000)));

        if (limited) {
            logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, key, maxRequests });

            return c.json({
                status: 'error',
                code: 429,
                message,
                retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
            }, 429);
        }

        return next();
    };
}

// ============================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================

/**
 * Global rate limiter for all API requests
 * Default: 100 requests per minute per IP
 */
export const globalRateLimiter = createRateLimiter({
    windowMs: RATE_LIMITS.GLOBAL.WINDOW_MS,
    maxRequests: RATE_LIMITS.GLOBAL.REQUESTS_PER_MINUTE,
    keyPrefix: 'global',
    message: MIDDLEWARE.ERROR.TOO_MANY_REQUESTS_RETRY,
});

/**
 * Stricter rate limiter for mutation (write) operations
 * Default: 30 requests per minute per IP
 */
export const mutationRateLimiter = createRateLimiter({
    windowMs: RATE_LIMITS.MUTATION.WINDOW_MS,
    maxRequests: RATE_LIMITS.MUTATION.REQUESTS_PER_MINUTE,
    keyPrefix: 'mutation',
    message: MIDDLEWARE.ERROR.TOO_MANY_WRITE_OPS,
});

/**
 * Very strict rate limiter for registration
 * Default: 5 registrations per hour per IP
 */
export const registrationRateLimiter = createRateLimiter({
    windowMs: RATE_LIMITS.REGISTER.WINDOW_MS,
    maxRequests: RATE_LIMITS.REGISTER.REQUESTS_PER_HOUR,
    keyPrefix: 'register',
    message: MIDDLEWARE.ERROR.REGISTRATION_LIMIT_EXCEEDED,
});

/**
 * Admin login rate limiter (stricter)
 * 10 attempts per 15 minutes per IP
 */
export const adminLoginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'admin-login',
    message: MIDDLEWARE.ERROR.TOO_MANY_LOGIN_ATTEMPTS,
});
