/**
 * packages/storage/src/constants.ts
 * 
 * Storage System Constants (Zero Hardcode)
 */

export const STORAGE_SYSTEM = {
    ENV_KEYS: {
        DATABASE_URL: 'DATABASE_URL',
    },
    STATUS: {
        SUCCESS: 'success' as const,
        ERROR: 'error' as const,
    },
    HTTP_CODE: {
        OK: 200,
        INTERNAL_ERROR: 500,
    },
    ERRORS: {
        DB_URL_MISSING: 'STORAGE.ERROR.DB_URL_MISSING',
        DB_CONNECTION_FAILED: 'STORAGE.ERROR.DB_CONNECTION_FAILED',
        STATS_FETCH_FAILED: 'STORAGE.ERROR.STATS_FETCH_FAILED',
    },
    LOGS: {
        STATS_ERROR: 'STORAGE.LOG.STATS_ERROR',
    },
    PARAMS: {
        NAME: 'name',
    },
    DEFAULTS: {
        ZERO_STRING: '0',
    },
} as const;
