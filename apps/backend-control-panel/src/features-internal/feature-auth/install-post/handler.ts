/**
 * install-post/handler.ts
 */
import type { Context } from 'hono';
import { processAdminInstall } from './logic';

const rateLimits = new Map<string, { count: number; windowStart: number }>();

export const handler = async (c: Context) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    let data = rateLimits.get(ip);
    if (!data || now - data.windowStart > 60000) data = { count: 0, windowStart: now };
    data.count++;
    rateLimits.set(ip, data);
    
    if (data.count > 5) return c.json({ success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }, 429);

    try {
        const { username, password } = await c.req.json();
        const db = c.get('internalDb' as any);
        const newAdmin = await processAdminInstall(db, username, password);
        return c.json({ success: true, data: newAdmin, message: 'Installation Complete!' }, 201);
    } catch (err: any) {
        return c.json({ success: false, error: { code: 'INSTALL_FAILED', message: err.message } }, 400);
    }
};
