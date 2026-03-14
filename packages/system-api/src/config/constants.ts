/**
 * packages/system-api/src/config/constants.ts
 *
 * Internal constants for system-api logic
 */

export const API_CONSTANTS = {
    CRYPTO: {
        KEY_PREFIX: {
            PUBLIC: 'pk_'
        },
        BYTES: {
            API_KEY: 32
        },
        ENCODING: {
            HEX: 'hex' as const
        }
    },
    QUERY_LIMITS: {
        DEFAULT_LOGS: 100
    },
    VALIDATION: {
        CATEGORY_NAME: {
            MIN: 1,
            MAX: 100
        }
    },
    PARAMS: {
        LIMIT: 'limit',
        PATH: 'path',
        METHOD: 'method',
        ID: 'id'
    },
    DEFAULTS: {
        OPERATION_TYPE: 'read'
    },
    URL_SEPARATOR: '/'
};
