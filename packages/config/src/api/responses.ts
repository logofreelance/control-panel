// packages/config/src/api/responses.ts
// Response helpers and status codes with i18n-friendly error codes

import type { Context } from 'hono';

/**
 * HTTP Status Codes commonly used
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * i18n-friendly Error Codes
 * Frontend can map these to localized messages
 * 
 * @example
 * ```typescript
 * // Frontend translation mapping
 * const errorTranslations = {
 *   'AUTH_UNAUTHORIZED': 'Anda harus login terlebih dahulu',
 *   'AUTH_FORBIDDEN': 'Akses ditolak',
 *   'AUTH_TOKEN_EXPIRED': 'Sesi Anda telah berakhir',
 * };
 * ```
 */
export const ERROR_CODES = {
    // Authentication Errors (AUTH_*)
    AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
    AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
    AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    AUTH_API_KEY_MISSING: 'AUTH_API_KEY_MISSING',
    AUTH_API_KEY_INVALID: 'AUTH_API_KEY_INVALID',

    // Validation Errors (VALIDATION_*)
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
    VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    VALIDATION_TOO_SHORT: 'VALIDATION_TOO_SHORT',
    VALIDATION_TOO_LONG: 'VALIDATION_TOO_LONG',

    // Resource Errors (RESOURCE_*)
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    RESOURCE_DELETED: 'RESOURCE_DELETED',

    // Server Errors (SERVER_*)
    SERVER_ERROR: 'SERVER_ERROR',
    SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
    SERVER_TIMEOUT: 'SERVER_TIMEOUT',
    SERVER_NOT_READY: 'SERVER_NOT_READY',

    // Database Errors (DB_*)
    DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
    DB_QUERY_FAILED: 'DB_QUERY_FAILED',

    // General Errors
    BAD_REQUEST: 'BAD_REQUEST',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Standard API response structure with i18n support
 */
export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    message?: string;
    errorCode?: string;  // i18n-friendly error code
    data?: T;
    errors?: string[];
}

/**
 * Create a success response
 */
export function success<T>(
    c: Context,
    data?: T,
    message?: string,
    status: number = HTTP_STATUS.OK
) {
    const response: ApiResponse<T> = { status: 'success' };
    if (data !== undefined) response.data = data;
    if (message) response.message = message;
    return c.json(response, status as any);
}

/**
 * Create an error response with i18n-friendly errorCode
 * 
 * @example
 * return error(c, 'User not found', 404, 'RESOURCE_NOT_FOUND');
 */
export function error(
    c: Context,
    message: string,
    status: number = HTTP_STATUS.INTERNAL_ERROR,
    errorCode?: string,
    errors?: string[]
) {
    const response: ApiResponse = {
        status: 'error',
        message,
        errorCode: errorCode || ERROR_CODES.UNKNOWN_ERROR
    };
    if (errors && errors.length > 0) response.errors = errors;
    return c.json(response, status as any);
}

/**
 * Create a validation error response
 */
export function validationError(c: Context, errors: string[]) {
    return error(c, 'Validation failed', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED, errors);
}

/**
 * Create paginated response
 */
export function paginated<T>(
    c: Context,
    data: T[],
    pagination: {
        page: number;
        limit: number;
        total: number;
    },
    message?: string
) {
    return c.json({
        status: 'success',
        message,
        data,
        pagination: {
            ...pagination,
            totalPages: Math.ceil(pagination.total / pagination.limit),
        },
    });
}

// Shorthand error creators with errorCode
export const notFound = (c: Context, message = 'Resource not found') =>
    error(c, message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);

export const unauthorized = (c: Context, message = 'Unauthorized') =>
    error(c, message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_UNAUTHORIZED);

export const forbidden = (c: Context, message = 'Access forbidden') =>
    error(c, message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTH_FORBIDDEN);

export const badRequest = (c: Context, message = 'Bad request', errorCode = ERROR_CODES.BAD_REQUEST) =>
    error(c, message, HTTP_STATUS.BAD_REQUEST, errorCode);

export const serverError = (c: Context, message = 'Internal server error') =>
    error(c, message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.SERVER_ERROR);

export const systemNotReady = (c: Context) =>
    error(c, 'System not ready', HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.SERVER_NOT_READY);

export const conflict = (c: Context, message = 'Resource already exists') =>
    error(c, message, HTTP_STATUS.CONFLICT, ERROR_CODES.RESOURCE_ALREADY_EXISTS);
