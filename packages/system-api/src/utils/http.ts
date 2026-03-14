import { Context } from 'hono';

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    FAILED: 'failed',
} as const;

export interface ApiResponse<T = any> {
    status: 'success' | 'error' | 'failed';
    message?: string;
    data?: T;
    errors?: any[];
}

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
    message: string = 'Internal Server Error',
    status: number = HTTP_STATUS.INTERNAL_ERROR,
    errors?: any[]
) {
    const response: ApiResponse = { status: 'error', message };
    if (errors) response.errors = errors;
    return c.json(response, status as any);
}

export function badRequest(c: Context, message: string = 'Bad Request', errors?: any[]) {
    return error(c, message, HTTP_STATUS.BAD_REQUEST, errors);
}

export function unauthorized(c: Context, message: string = 'Unauthorized') {
    return error(c, message, HTTP_STATUS.UNAUTHORIZED);
}

export function forbidden(c: Context, message: string = 'Forbidden') {
    return error(c, message, HTTP_STATUS.FORBIDDEN);
}

export function notFound(c: Context, message: string = 'Not Found') {
    return error(c, message, HTTP_STATUS.NOT_FOUND);
}

export function conflict(c: Context, message: string = 'Conflict') {
    return error(c, message, HTTP_STATUS.CONFLICT);
}

export function serverError(c: Context, message: string = 'Internal Server Error') {
    return error(c, message, HTTP_STATUS.INTERNAL_ERROR);
}
