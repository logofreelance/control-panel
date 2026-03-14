import { Context } from 'hono';
import { MIDDLEWARE_SYSTEM } from './config/constants';

export const getEnv = (c: Context) => c.env as any;

export const getClientIp = (headers: { get(name: string): string | undefined }): string => {
    const forwarded = headers.get(MIDDLEWARE_SYSTEM.HEADERS.X_FORWARDED_FOR);
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = headers.get(MIDDLEWARE_SYSTEM.HEADERS.X_REAL_IP);
    return realIp || '127.0.0.1';
};

export const safeJsonStringify = (data: any, fallback: string = '{}'): string => {
    try {
        return JSON.stringify(data);
    } catch {
        return fallback;
    }
};

export const unauthorized = (c: Context, message: string = 'Unauthorized') => {
    return c.json({ status: 'error', message }, 401);
};

export const forbidden = (c: Context, message: string = 'Forbidden') => {
    return c.json({ status: 'error', message }, 403);
};

export const serverError = (c: Context, message: string = 'Internal Server Error') => {
    return c.json({ status: 'error', message }, 500);
};

export const systemNotReady = (c: Context) => {
    return c.json({ status: 'error', message: 'System Not Ready' }, 503);
};

export const isSuperRole = (role: string) => role === 'super_admin';

export const isProd = (): boolean => {
    try {
        return process?.env?.NODE_ENV !== 'development';
    } catch {
        return true; // Default to production in Workers
    }
};
