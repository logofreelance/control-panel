/**
 * me-get/handler.ts
 */
import type { Context } from 'hono';
import * as model from './model';

export const handler = async (c: Context) => {
    const user = c.get('user' as any);
    if (!user) return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
    
    try {
        const db = c.get('internalDb' as any);
        const profile = await model.findAdminUserProfileById(db, user.id);
        if (!profile) return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
        return c.json({ success: true, data: profile, message: 'Profile retrieved' });
    } catch (err: any) {
        return c.json({ success: false, error: { code: 'UNKNOWN_ERROR', message: err.message } }, 500);
    }
};
