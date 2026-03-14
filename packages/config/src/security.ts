/**
 * packages/config/src/security.ts
 * 
 * Centralized Security Utilities for Backend
 * - SQL escaping and sanitization
 * - JSON parsing with fallback
 * - Security validation helpers
 * - Rate limiting constants
 */

// ============================================
// SECURITY LIMITS & CONSTANTS
// ============================================

export const SECURITY_LIMITS = {
    /** Maximum identifier length (table/column names) */
    IDENTIFIER_MAX_LENGTH: 64,

    /** Maximum request body size in bytes (1MB) */
    MAX_BODY_SIZE: 1024 * 1024,

    /** Request timeout in milliseconds (30 seconds) */
    REQUEST_TIMEOUT_MS: 30000,

    /** Minimum JWT secret length */
    JWT_SECRET_MIN_LENGTH: 32,

    /** Maximum bulk operation items */
    MAX_BULK_ITEMS: 1000,

    /** Default query limit */
    DEFAULT_QUERY_LIMIT: 100,

    /** Maximum query limit */
    MAX_QUERY_LIMIT: 10000,

    /** CORS cache TTL in milliseconds (1 minute) */
    CORS_CACHE_TTL_MS: 60 * 1000,
} as const;

export const RATE_LIMITS = {
    /** Global API rate limit per minute per IP */
    GLOBAL: {
        REQUESTS_PER_MINUTE: 1000, // Development: 1000, Production: 200
        PRODUCTION_REQUESTS_PER_MINUTE: 200,
        WINDOW_MS: 60 * 1000,
    },
    /** Mutation (write) rate limit */
    MUTATION: {
        REQUESTS_PER_MINUTE: 100, // Development: 100, Production: 50
        PRODUCTION_REQUESTS_PER_MINUTE: 50,
        WINDOW_MS: 60 * 1000,
    },
    /** Registration rate limit per IP */
    REGISTER: {
        REQUESTS_PER_HOUR: 10,  // Development: 10, Production: 5
        PRODUCTION_REQUESTS_PER_HOUR: 5,
        WINDOW_MS: 60 * 60 * 1000,
    },
    /** Authenticated user rate limit (higher than unauthenticated) */
    AUTHENTICATED: {
        REQUESTS_PER_MINUTE: 500, // Development: 500, Production: 300
        PRODUCTION_REQUESTS_PER_MINUTE: 300,
        WINDOW_MS: 60 * 1000,
    },
} as const;

// ============================================
// SQL ESCAPING UTILITIES
// ============================================

/**
 * Escape a string value for safe SQL insertion
 * Handles: single quotes, backslashes, null bytes, newlines
 * 
 * @param value - Value to escape
 * @returns Escaped string (without surrounding quotes)
 */
export function escapeSQL(value: unknown): string {
    if (value === null || value === undefined) {
        return 'NULL';
    }

    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return 'NULL';
        }
        return String(value);
    }

    const str = String(value);

    // Escape special characters for MySQL
    const escaped = str
        .replace(/\\/g, '\\\\')     // Backslash first
        .replace(/'/g, "''")         // Single quotes (MySQL style)
        .replace(/\0/g, '\\0')       // Null bytes
        .replace(/\n/g, '\\n')       // Newlines
        .replace(/\r/g, '\\r')       // Carriage returns
        .replace(/\x1a/g, '\\Z');    // Ctrl+Z (EOF in Windows)

    return `'${escaped}'`;
}

/**
 * Sanitize an identifier (table name, column name)
 * Only allows alphanumeric and underscore, max 64 chars
 * 
 * @param name - Identifier to sanitize
 * @returns Sanitized identifier or empty string if invalid
 */
export function sanitizeIdentifier(name: unknown): string {
    if (!name || typeof name !== 'string') {
        return '';
    }

    return name
        .replace(/[^a-zA-Z0-9_]/g, '')
        .slice(0, SECURITY_LIMITS.IDENTIFIER_MAX_LENGTH);
}

/**
 * Check if a value is a safe integer for SQL
 */
export function isSafeInteger(value: unknown): value is number {
    return typeof value === 'number'
        && Number.isInteger(value)
        && Number.isFinite(value)
        && value >= 0
        && value <= Number.MAX_SAFE_INTEGER;
}

/**
 * Validate and sanitize an array of IDs for bulk operations
 * 
 * @param ids - Array of IDs to validate
 * @param maxItems - Maximum allowed items (default: 1000)
 * @returns Array of valid integer IDs
 * @throws Error if any ID is invalid or too many items
 */
export function validateBulkIds(ids: unknown, maxItems: number = SECURITY_LIMITS.MAX_BULK_ITEMS): number[] {
    if (!Array.isArray(ids)) {
        throw new Error('IDs must be an array');
    }

    if (ids.length === 0) {
        throw new Error('IDs array cannot be empty');
    }

    if (ids.length > maxItems) {
        throw new Error(`Maximum ${maxItems} items allowed per bulk operation`);
    }

    const validIds: number[] = [];

    for (const id of ids) {
        if (!isSafeInteger(id) || id <= 0) {
            throw new Error(`Invalid ID: ${id}. All IDs must be positive integers.`);
        }
        validIds.push(id);
    }

    return validIds;
}

// ============================================
// JSON UTILITIES
// ============================================

/**
 * Safely parse JSON with a fallback value
 * 
 * @param str - JSON string to parse
 * @param fallback - Value to return if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
    if (!str || typeof str !== 'string') {
        return fallback;
    }

    try {
        return JSON.parse(str) as T;
    } catch {
        return fallback;
    }
}

/**
 * Safely stringify JSON with error handling
 */
export function safeJsonStringify(value: unknown, fallback: string = '{}'): string {
    try {
        return JSON.stringify(value);
    } catch {
        return fallback;
    }
}

// ============================================
// JWT VALIDATION
// ============================================

/**
 * Validate JWT secret strength
 * 
 * @param secret - JWT secret to validate
 * @throws Error if secret is too short or weak
 */
export function validateJwtSecret(secret: string | undefined): void {
    if (!secret) {
        throw new Error('JWT_SECRET is required');
    }

    if (secret.length < SECURITY_LIMITS.JWT_SECRET_MIN_LENGTH) {
        throw new Error(`JWT_SECRET must be at least ${SECURITY_LIMITS.JWT_SECRET_MIN_LENGTH} characters (currently ${secret.length})`);
    }

    // Check for common weak secrets
    const weakSecrets = ['secret', 'password', '12345678', 'changeme', 'development'];
    if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
        console.warn('[SECURITY WARNING] JWT_SECRET appears to contain a weak pattern. Use a strong random secret in production.');
    }
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate that an object only contains allowed keys
 */
export function validateAllowedKeys(
    obj: Record<string, unknown>,
    allowedKeys: string[]
): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const allowedSet = new Set(allowedKeys);

    for (const [key, value] of Object.entries(obj)) {
        if (allowedSet.has(key)) {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate and sanitize selectable columns string
 * Validates against schema whitelist to prevent SQL injection
 * 
 * @param columns - Column string (e.g., "id,name,email" or "*")
 * @param schemaColumns - Array of valid column definitions from schema
 * @returns Sanitized column string safe for SQL
 * @throws Error if columns contain invalid or non-existent columns
 */
export function validateSelectableColumns(
    columns: string | null | undefined,
    schemaColumns: Array<{ name: string }>
): string {
    // Allow wildcard
    if (!columns || columns.trim() === '*') {
        return '*';
    }

    // Get valid column names from schema
    const validColumnNames = new Set(schemaColumns.map(col => col.name.toLowerCase()));

    // Split and validate each column
    const columnList = columns
        .split(',')
        .map(col => col.trim())
        .filter(Boolean);

    if (columnList.length === 0) {
        return '*';
    }

    // Validate each column exists in schema
    const sanitizedColumns: string[] = [];
    for (const col of columnList) {
        const sanitized = sanitizeIdentifier(col);
        if (!sanitized) {
            logSecurityEvent('SQL_INJECTION_ATTEMPT', {
                reason: 'Invalid column name format',
                column: col
            });
            throw new Error(`Invalid column name: ${col}`);
        }

        // Check if column exists in schema (case-insensitive)
        if (!validColumnNames.has(sanitized.toLowerCase())) {
            logSecurityEvent('SQL_INJECTION_ATTEMPT', {
                reason: 'Column not in schema',
                column: sanitized,
                validColumns: Array.from(validColumnNames)
            });
            throw new Error(`Column "${sanitized}" does not exist in schema`);
        }

        sanitizedColumns.push(`\`${sanitized}\``);
    }

    return sanitizedColumns.join(', ');
}

// ============================================
// IP UTILITIES
// ============================================

/**
 * Extract client IP from request headers
 * Handles X-Forwarded-For and X-Real-IP
 */
export function getClientIp(headers: {
    get(name: string): string | undefined;
}): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    return '127.0.0.1';
}

// ============================================
// LOGGING HELPERS
// ============================================

/**
 * Security event types for logging
 */
export const SECURITY_EVENTS = {
    SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    INVALID_TOKEN: 'invalid_token',
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    INVALID_INPUT: 'invalid_input',
    BULK_OPERATION_LIMIT: 'bulk_operation_limit',
} as const;

/**
 * Log a security event (for future integration with logging service)
 */
export function logSecurityEvent(
    event: keyof typeof SECURITY_EVENTS,
    details: Record<string, unknown>
): void {
    const timestamp = new Date().toISOString();
    console.warn(`[SECURITY] [${timestamp}] ${event}:`, JSON.stringify(details));
}
