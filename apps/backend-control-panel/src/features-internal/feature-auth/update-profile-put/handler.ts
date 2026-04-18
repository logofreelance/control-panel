/**
 * update-profile-put/handler.ts
 */
import type { Context } from 'hono';
import { processUpdateAdminProfile } from './logic';

export const handler = async (c: Context) => {
    const user = c.get('user' as any);
    if (!user) return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
    
    try {
        const { username } = await c.req.json();
        const db = c.get('internalDb' as any);
        const updated = await processUpdateAdminProfile(db, user.id, username);
        return c.json({ success: true, data: updated, message: 'Admin profile updated' });
    } catch (err: any) {
        return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } }, 400);
    }
};
