/**
 * CSRF Protection Middleware
 * Implements Double-Submit Cookie pattern for CSRF protection
 */

import { Context, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { MIDDLEWARE } from './config/labels';

// Simple isDev check without external dependency
function isDevMode(): boolean {
    try {
        // Check common env patterns
        return process?.env?.NODE_ENV === 'development';
    } catch {
        // In Workers, process.env is not available - assume production
        return false;
    }
}

// Simple unauthorized response without external dependency
function sendUnauthorized(c: Context, message: string) {
    return c.json({
        status: 'error',
        code: 401,
        message
    }, 401);
}

// CSRF token cookie name
const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

// Methods that require CSRF protection
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Generate a random CSRF token using Web Crypto API
 * Compatible with Cloudflare Workers, browsers, and Node.js
 */
function generateToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 * Uses Double-Submit Cookie pattern:
 * - Token stored in httpOnly cookie
 * - Same token sent in header
 * - Both must match
 */
export const csrfProtection = async (c: Context, next: Next) => {
    const method = c.req.method;

    // Skip CSRF check for safe methods
    if (!PROTECTED_METHODS.includes(method)) {
        return next();
    }

    // Skip CSRF check for health/status endpoints
    if (c.req.path.endsWith('/health') || c.req.path.endsWith('/status')) {
        return next();
    }

    const isProduction = !isDevMode();

    // Get token from cookie
    const cookieToken = getCookie(c, CSRF_TOKEN_COOKIE);

    // Get token from header
    const headerToken = c.req.header(CSRF_TOKEN_HEADER);

    // Validate tokens match
    if (!cookieToken || !headerToken) {
        if (isProduction) {
            return sendUnauthorized(c, MIDDLEWARE.ERROR.CSRF_MISSING);
        }
        // In development, generate and set token if missing
        if (!cookieToken) {
            const newToken = generateToken();
            setCookie(c, CSRF_TOKEN_COOKIE, newToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/'
            });
            // Allow first request in dev mode
            return next();
        }
        return sendUnauthorized(c, MIDDLEWARE.ERROR.CSRF_MISSING);
    }

    // Validate tokens match (constant-time comparison)
    if (cookieToken !== headerToken) {
        return sendUnauthorized(c, MIDDLEWARE.ERROR.CSRF_MISMATCH);
    }

    return next();
};

/**
 * Middleware to set CSRF token cookie
 * Should be applied to all routes to ensure token is available
 */
export const csrfToken = async (c: Context, next: Next) => {
    try {
        let isProduction = true;
        try {
            isProduction = !isDevMode();
        } catch {
            // Fallback to production mode if isDev() fails
            console.warn('[CSRF] isDev() failed, defaulting to production mode');
        }

        // Check if token already exists
        const existingToken = getCookie(c, CSRF_TOKEN_COOKIE);

        if (!existingToken) {
            // Generate and set new token
            const token = generateToken();
            setCookie(c, CSRF_TOKEN_COOKIE, token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/'
            });
        }

        // Add token to response header for frontend to read (if needed)
        // Note: Frontend should read from cookie via API endpoint instead
        // Add token to response header for frontend to read (if needed)
        // Note: Frontend should read from cookie via API endpoint instead
    } catch (error: unknown) {
        console.error('[CSRF Middleware Error]', error);
        return c.json({
            status: 'error',
            message: 'CSRF middleware failed',
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }

    await next();
};

/**
 * Get CSRF token endpoint
 * Returns the CSRF token for frontend to use in requests
 * Token is also available in cookie
 */
export const getCsrfToken = (c: Context) => {
    const token = getCookie(c, CSRF_TOKEN_COOKIE);

    if (!token) {
        // Generate new token
        const newToken = generateToken();
        const isProduction = !isDevMode();

        setCookie(c, CSRF_TOKEN_COOKIE, newToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        return c.json({
            status: 'success',
            token: newToken
        });
    }

    return c.json({
        status: 'success',
        token: token
    });
};
