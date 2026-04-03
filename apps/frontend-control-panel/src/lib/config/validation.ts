// packages/config/src/validation.ts
// Centralized validation rules and helpers for user input

import { ERROR } from './messages';

// ============================================
// USERNAME VALIDATION RULES
// ============================================
export const USERNAME_RULES = {
    /** Minimum username length */
    MIN_LENGTH: 5,
    /** Maximum username length */
    MAX_LENGTH: 20,
    /** Pattern: must start with letter, then letters/numbers/underscores */
    PATTERN: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    /** Maximum consecutive same characters allowed */
    MAX_CONSECUTIVE_SAME: 3,
} as const;

// ============================================
// EMAIL VALIDATION RULES
// ============================================
export const EMAIL_RULES = {
    /** RFC 5322 simplified pattern */
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    /** Maximum email length */
    MAX_LENGTH: 100,
} as const;

// ============================================
// RESERVED USERNAMES
// These usernames cannot be registered
// ============================================
export const RESERVED_USERNAMES = [
    // System roles
    'admin', 'administrator', 'root', 'system', 'super_admin', 'superadmin',
    'moderator', 'mod', 'user', 'guest',
    // Common reserved
    'support', 'help', 'api', 'www', 'mail', 'email', 'info', 'contact',
    'webmaster', 'postmaster', 'hostmaster',
    // Technical
    'null', 'undefined', 'test', 'testing', 'demo',
    // Brand protection
    'official', 'verified', 'staff', 'team',
] as const;

// ============================================
// VALIDATION RESULT TYPE
// ============================================
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

// ============================================
// USERNAME VALIDATION
// ============================================
/**
 * Validate username against security rules
 * @param username - Username to validate
 * @returns Validation result with errors if any
 */
export function validateUsername(username: string): ValidationResult {
    const errors: string[] = [];

    // Null/undefined check
    if (!username) {
        errors.push(ERROR.MISSING_REGISTRATION_FIELDS);
        return { valid: false, errors };
    }

    const trimmed = username.trim();

    // Length checks
    if (trimmed.length < USERNAME_RULES.MIN_LENGTH) {
        errors.push(ERROR.USERNAME_TOO_SHORT);
    }

    if (trimmed.length > USERNAME_RULES.MAX_LENGTH) {
        errors.push(ERROR.USERNAME_TOO_LONG);
    }

    // Must start with letter
    if (!/^[a-zA-Z]/.test(trimmed)) {
        errors.push(ERROR.USERNAME_MUST_START_LETTER);
    }

    // Alphanumeric + underscore only
    if (!USERNAME_RULES.PATTERN.test(trimmed)) {
        errors.push(ERROR.USERNAME_INVALID_FORMAT);
    }

    // No consecutive same characters (e.g., "aaaa", "1111")
    const consecutivePattern = new RegExp(`(.)\\1{${USERNAME_RULES.MAX_CONSECUTIVE_SAME - 1},}`);
    if (consecutivePattern.test(trimmed)) {
        errors.push(ERROR.USERNAME_CONSECUTIVE_CHARS);
    }

    // Reserved username check (case-insensitive)
    if (RESERVED_USERNAMES.includes(trimmed.toLowerCase() as typeof RESERVED_USERNAMES[number])) {
        errors.push(ERROR.USERNAME_RESERVED);
    }

    return { valid: errors.length === 0, errors };
}

// ============================================
// EMAIL VALIDATION
// ============================================
/**
 * Validate email format
 * @param email - Email to validate
 * @returns Validation result with errors if any
 */
export function validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    // Null/undefined check
    if (!email) {
        errors.push(ERROR.MISSING_REGISTRATION_FIELDS);
        return { valid: false, errors };
    }

    const trimmed = email.trim();

    // Length check
    if (trimmed.length > EMAIL_RULES.MAX_LENGTH) {
        errors.push(ERROR.EMAIL_TOO_LONG);
    }

    // Format check
    if (!EMAIL_RULES.PATTERN.test(trimmed)) {
        errors.push(ERROR.EMAIL_INVALID_FORMAT);
    }

    return { valid: errors.length === 0, errors };
}
