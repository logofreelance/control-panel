// packages/config/src/auth.ts
// Authentication and security configuration

/**
 * JWT Configuration
 */
export const JWT = {
    /** Token expiry for admin users */
    ADMIN_EXPIRES_IN: '1d',

    /** Token expiry for regular users (default, no remember me) */
    USER_EXPIRES_IN: '1d',

    /** Token expiry for remember me sessions */
    REMEMBER_ME_EXPIRES_IN: '30d',

    /** JWT signing algorithm */
    ALGORITHM: 'HS256' as const,
} as const;

/**
 * Password Configuration
 */
export const PASSWORD = {
    /** Bcrypt salt rounds for hashing */
    SALT_ROUNDS: 10,

    /** Minimum password length */
    MIN_LENGTH: 8,

    /** Require at least one uppercase letter */
    REQUIRE_UPPERCASE: true,

    /** Require at least one number */
    REQUIRE_NUMBER: true,

    /** Require at least one special character */
    REQUIRE_SPECIAL: false,
} as const;

/**
 * Session Configuration
 */
export const SESSION = {
    /** Remember me duration in days */
    REMEMBER_ME_DAYS: 30,

    /** Default session duration in days (no remember me) */
    DEFAULT_DAYS: 1,

    /** Session cookie name */
    COOKIE_NAME: 'session',

    /** Cookie secure flag (HTTPS only) */
    SECURE: true,

    /** Cookie httpOnly flag */
    HTTP_ONLY: true,
} as const;

/**
 * Rate Limit Configuration
 */
export const RATE_LIMIT = {
    LOGIN: {
        /** Maximum failed login attempts before lockout */
        MAX_ATTEMPTS: 5,
        /** Time window in minutes for counting attempts */
        WINDOW_MINUTES: 15,
        /** Lockout duration in minutes after max attempts */
        LOCKOUT_MINUTES: 30,
    },
    REGISTER: {
        /** Maximum registrations per IP */
        MAX_PER_IP: 3,
        /** Time window in hours */
        WINDOW_HOURS: 24,
    },
} as const;

/**
 * Token Blacklist Configuration
 */
export const TOKEN_BLACKLIST = {
    /** How often to cleanup expired tokens (in hours) */
    CLEANUP_INTERVAL_HOURS: 24,
} as const;

/**
 * Login Failure Reasons
 */
export const LOGIN_FAILURE = {
    INVALID_PASSWORD: 'invalid_password',
    ACCOUNT_DISABLED: 'account_disabled',
    RATE_LIMITED: 'rate_limited',
    USER_NOT_FOUND: 'user_not_found',
} as const;

/**
 * Combined auth configuration
 */
export const AUTH = {
    JWT,
    PASSWORD,
    SESSION,
    RATE_LIMIT,
    TOKEN_BLACKLIST,
} as const;

/**
 * Helper: Get JWT expiry based on user type
 */
export const getJwtExpiry = (isAdmin: boolean = false): string =>
    isAdmin ? JWT.ADMIN_EXPIRES_IN : JWT.USER_EXPIRES_IN;

/**
 * Helper: Get login token expiry based on remember me option
 * @param rememberMe - Whether user chose to stay logged in
 * @returns JWT expiry string (e.g., '1d', '30d')
 */
export const getLoginExpiry = (rememberMe: boolean = false): string =>
    rememberMe ? JWT.REMEMBER_ME_EXPIRES_IN : JWT.USER_EXPIRES_IN;

/**
 * Helper: Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < PASSWORD.MIN_LENGTH) {
        errors.push(`Password must be at least ${PASSWORD.MIN_LENGTH} characters`);
    }

    if (PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (PASSWORD.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
}
