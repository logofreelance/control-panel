/**
 * logout-post/handler.ts
 */
import type { Context } from 'hono';

export const handler = async (c: Context) => {
    const lucia = c.get('lucia' as any);
    const cookieHeader = c.req.header('Cookie') || '';
    const sessionId = lucia.readSessionCookie(cookieHeader) || lucia.readBearerToken(c.req.header('Authorization') || '');
    
    if (sessionId) {
        try { await lucia.invalidateSession(sessionId); } catch (e) {}
    }
    
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
    c.header('Clear-Site-Data', '"cookies", "storage"', { append: true });
    
    return c.json({ success: true, data: null, message: 'Logged out successfully' });
};
