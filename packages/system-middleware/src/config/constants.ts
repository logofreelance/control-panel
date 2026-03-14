export const MIDDLEWARE_SYSTEM = {
    HEADERS: {
        AUTHORIZATION: 'Authorization',
        USER_AGENT: 'User-Agent',
        X_FORWARDED_FOR: 'x-forwarded-for',
        X_REAL_IP: 'x-real-ip',
        X_RATE_LIMIT_LIMIT: 'X-RateLimit-Limit',
        X_RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
        X_RATE_LIMIT_RESET: 'X-RateLimit-Reset'
    },
    CONTEXT_KEYS: {
        USER: 'user'
    },
    ROLES: {
        GUEST: 'guest'
    },
    STATUS: {
        SUCCESS: 'success',
        ERROR: 'error'
    },
    RATE_LIMITS: {
        GLOBAL: { WINDOW_MS: 60 * 1000, REQUESTS_PER_MINUTE: 100 },
        MUTATION: { WINDOW_MS: 60 * 1000, REQUESTS_PER_MINUTE: 30 },
        REGISTER: { WINDOW_MS: 60 * 60 * 1000, REQUESTS_PER_HOUR: 5 }
    }
} as const;
