/**
 * health-check-post/handler.ts
 */
import type { Context } from 'hono';
import { performHealthCheck } from './logic';

export const handler = async (c: Context) => {
    try {
        const id = c.req.param('id')!;
        const db = c.get('internalDb' as any);
        const result = await performHealthCheck(db, id);
        return c.json({ success: true, data: result });
    } catch (err: any) {
        if (err.message === 'Target system not found') {
            return c.json({ success: false, error: { message: err.message } }, 404);
        }
        return c.json({ success: false, error: { message: err.message } }, 500);
    }
};

