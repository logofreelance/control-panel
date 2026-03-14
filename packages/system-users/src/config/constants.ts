export const DEFAULT_USER_ROLE = 'user';

export const USER_SYSTEM = {
    HTTP_CODE: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    },
    STATUS: {
        SUCCESS: 'success',
        ERROR: 'error'
    },
    ERRORS: {
        GENERIC: 'USER.ERROR.GENERIC',
        ALREADY_EXISTS: 'USER.ERROR.ALREADY_EXISTS',
        NOT_FOUND: 'USER.ERROR.NOT_FOUND',
        PASSWORD_REQUIRED: 'USER.ERROR.PASSWORD_REQUIRED',
        ROLE_NOT_EXISTS: 'USER.ERROR.ROLE_NOT_EXISTS',
        ROLE_NOT_FOUND: 'USER.ERROR.ROLE_NOT_FOUND',
        DB_URL_MISSING: 'USER.ERROR.DB_URL_MISSING'
    },
    ENV_KEYS: {
        DATABASE_URL: 'DATABASE_URL'
    },
    API_PARAMS: {
        ID: 'id'
    },
    BACKEND_ERRORS: {
        internalError: 'INTERNAL_ERROR' // Simplified
    }
} as const;
