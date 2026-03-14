export const AUTH_CONSTANTS = {
    // JWT Configuration Defaults
    JWT: {
        ADMIN_EXPIRES_IN: '1d',
        USER_EXPIRES_IN: '7d',
        ALGORITHM: 'HS256',
    },
    TOKEN: {
        PREFIX: 'Bearer ',
        SEPARATOR: ' ',
    },
    TEMP: {
        REGISTER_SECRET: 'temp_secret_for_register',
        UNUSED_SECRET: 'unused_secret',
    },
    // Password Hashing
    PASSWORD: {
        SALT_ROUNDS: 10,
        PASSWORD_MIN_LENGTH: 8
    },
    // Defaults
    DEFAULTS: {
        USER_ROLE: 'user',
    },
    // Environment Keys used by this module
    ENV_KEYS: {
        DATABASE_URL: 'DATABASE_URL',
        JWT_SECRET: 'JWT_SECRET',
    },
    // Standard HTTP Status Codes used
    HTTP_CODE: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_ERROR: 500,
    },
    // Standard Response Status
    STATUS: {
        SUCCESS: 'success',
        ERROR: 'error',
    },
    // Error Codes
    ERRORS: {
        DB_URL_MISSING: 'DATABASE_URL not configured',
        JWT_SECRET_MISSING: 'JWT_SECRET not configured',
        DUPLICATE_ENTRY: 'Duplicate entry',
    }
} as const;
