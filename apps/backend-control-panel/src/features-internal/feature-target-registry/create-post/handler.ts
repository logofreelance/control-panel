/**
 * create-post/handler.ts
 */
import type { Context } from 'hono';
import { processCreateTarget } from './logic';

export const handler = async (c: Context) => {
    try {
        const body = await c.req.json();
        const db = c.get('internalDb' as any);
        const created = processCreateTarget(db, body);
        return c.json({ success: true, data: created, message: 'Target system created' }, 201);
    } catch (err: any) {
        return c.json({ success: false, error: { message: err.message } }, 400);
    }
};
