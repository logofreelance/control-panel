/**
 * login-post/handler.ts
 */
import type { Context } from 'hono';
import { processLogin } from './logic';
import { LOGIN_RATE_LIMIT, LOGIN_MESSAGES } from './config';

const rateLimits = new Map<string, { count: number; windowStart: number }>();

export const handler = async (c: Context) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    let data = rateLimits.get(ip);
    if (!data || now - data.windowStart > LOGIN_RATE_LIMIT.windowMs) data = { count: 0, windowStart: now };
    data.count++;
    rateLimits.set(ip, data);
    
    if (data.count > LOGIN_RATE_LIMIT.maxRequests) {
        return c.json({ success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } }, 429);
    }

    try {
        const { username, password } = await c.req.json();
        const db = c.get('internalDb' as any);
        const lucia = c.get('lucia' as any);
        const result = await processLogin(db, lucia, username, password);
        
        c.header('Set-Cookie', lucia.createSessionCookie(result.token).serialize(), { append: true });
        return c.json({ success: true, data: result, message: LOGIN_MESSAGES.success });
    } catch (err: any) {
        return c.json({ success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: err.message } }, 401);
    }
};
