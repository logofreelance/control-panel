// packages/config/src/api/headers.ts
// HTTP headers configuration

/**
 * Common HTTP Content-Type headers
 */
export const CONTENT_TYPE = {
    JSON: 'application/json',
    HTML: 'text/html',
    CSV: 'text/csv',
    XML: 'application/xml',
    FORM: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
} as const;

/**
 * Pre-built header objects for common use cases
 */
export const HEADERS = {
    /** JSON content type header */
    JSON: { 'Content-Type': CONTENT_TYPE.JSON } as const,

    /** CSV content type header */
    CSV: { 'Content-Type': CONTENT_TYPE.CSV } as const,

    /** HTML content type header */
    HTML: { 'Content-Type': CONTENT_TYPE.HTML } as const,
} as const;

/**
 * Allowed headers for CORS
 */
export const ALLOWED_HEADERS = [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-Id',
    'x-csrf-token',
] as const;

/**
 * Exposed headers in CORS response
 */
export const EXPOSED_HEADERS = [
    'X-Request-Id',
    'X-Total-Count',
] as const;

/**
 * Cache control presets
 */
export const CACHE_CONTROL = {
    NO_CACHE: 'no-cache, no-store, must-revalidate',
    PUBLIC_SHORT: 'public, max-age=60',
    PUBLIC_MEDIUM: 'public, max-age=3600',
    PUBLIC_LONG: 'public, max-age=86400',
    PRIVATE: 'private, max-age=0',
} as const;
