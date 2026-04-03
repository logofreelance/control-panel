// packages/config/src/cors.ts
// CORS configuration

/**
 * Default development origins (automatically allowed in dev mode)
 */
export const DEV_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
] as const;

/**
 * Allowed HTTP methods
 */
export const CORS_METHODS = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
] as const;

/**
 * CORS configuration
 */
export const CORS = {
    /** Development origins */
    DEV_ORIGINS,

    /** Allowed methods */
    METHODS: CORS_METHODS,

    /** Credentials allowed */
    CREDENTIALS: true,

    /** Max age for preflight cache (seconds) */
    MAX_AGE: 86400,
} as const;

/**
 * Helper: Get all allowed origins
 * Combines env origin with dev origins in development mode
 */
export function getAllowedOrigins(
    envOrigin?: string,
    isDev = false
): string[] {
    const origins: string[] = [];

    // Add environment-configured origins
    if (envOrigin) {
        if (envOrigin === '*') {
            return ['*'];
        }
        origins.push(...envOrigin.split(',').map(o => o.trim()));
    }

    // Add dev origins in development mode
    if (isDev) {
        origins.push(...DEV_ORIGINS);
    }

    // Remove duplicates
    return [...new Set(origins)];
}

/**
 * Helper: Check if origin is allowed
 */
export function isOriginAllowed(
    origin: string,
    envOrigin?: string,
    isDev = false
): boolean {
    const allowed = getAllowedOrigins(envOrigin, isDev);
    return allowed.includes('*') || allowed.includes(origin);
}
