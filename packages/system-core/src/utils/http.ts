import type { Context } from 'hono';

// ============================================
// CONSTANTS (Internalized)
// ============================================

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    FAILED: 'failed',
    GLOBAL: 'global',
    ROUTE: 'route',
    CATEGORY: 'category',
} as const;

export const API_PARAMS = {
    ID: 'id',
    STATUS_CODE: 'statusCode',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
    SUCCESS: 'SUCCESS',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
    SERVER_NOT_READY: 'SERVER_NOT_READY',
    DB_NOT_CONFIGURED: 'DB_NOT_CONFIGURED',
} as const;

// ============================================
// RESPONSE HELPERS
// ============================================

export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    message?: string;
    errorCode?: string;
    data?: T;
    errors?: string[];
}

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
        errorCode: errorCode || ERROR_CODES.SERVER_ERROR
    };
    if (errors && errors.length > 0) response.errors = errors;
    return c.json(response, status as any);
}

export const notFound = (c: Context, message = 'Resource not found') =>
    error(c, message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);

export const unauthorized = (c: Context, message = 'Unauthorized') =>
    error(c, message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_UNAUTHORIZED);

export const badRequest = (c: Context, message = 'Bad request', errorCode = ERROR_CODES.BAD_REQUEST) =>
    error(c, message, HTTP_STATUS.BAD_REQUEST, errorCode);

export const serverError = (c: Context, message = 'Internal server error') =>
    error(c, message, HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.SERVER_ERROR);

export const systemNotReady = (c: Context) =>
    error(c, 'System not ready', HTTP_STATUS.INTERNAL_ERROR, ERROR_CODES.SERVER_NOT_READY);

export const conflict = (c: Context, message = 'Resource already exists') =>
    error(c, message, HTTP_STATUS.CONFLICT, ERROR_CODES.RESOURCE_ALREADY_EXISTS);
