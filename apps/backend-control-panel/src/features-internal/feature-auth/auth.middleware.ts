import type { Context } from 'hono';

export function requireAuth(c: Context) {
    const user = c.get('user');
    if (!user) {
        return { 
            authorized: false, 
            error: { code: 'UNAUTHORIZED', message: 'Unauthorized - no valid session' } 
        };
    }
    return { authorized: true, user };
}

export function requireAuthOrRespond(c: Context) {
    const result = requireAuth(c);
    if (!result.authorized) {
        return c.json({ success: false, error: result.error }, 401);
    }
    return null;
}
