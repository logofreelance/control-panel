/**
 * update-put/handler.ts
 */
import type { Context } from 'hono';
import { processUpdateTarget } from './logic';

export const handler = async (c: Context) => {
    try {
        const id = c.req.param('id')!;
        const body = await c.req.json();
        const db = c.get('internalDb' as any);
        const updated = processUpdateTarget(db, id, body);
        return c.json({ success: true, data: updated, message: 'Target system updated' });
    } catch (err: any) {
        let status = 400;
        if (err.message === 'Target system not found') status = 404;
        return c.json({ success: false, error: { message: err.message } }, status as any);
    }
};

