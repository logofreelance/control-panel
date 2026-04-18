/**
 * change-password-put/handler.ts
 */
import type { Context } from 'hono';
import { processChangeAdminPassword } from './logic';

export const handler = async (c: Context) => {
    const user = c.get('user' as any);
    if (!user) return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401);
    
    try {
        const { currentPassword, newPassword } = await c.req.json();
        const db = c.get('internalDb' as any);
        await processChangeAdminPassword(db, user.id, currentPassword, newPassword);
        return c.json({ success: true, data: null, message: 'Password successfully updated' });
    } catch (err: any) {
        return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } }, 400);
    }
};
