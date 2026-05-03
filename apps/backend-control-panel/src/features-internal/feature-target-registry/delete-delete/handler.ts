/**
 * delete-delete/handler.ts
 */
import type { Context } from 'hono';
import { processDeleteTarget } from './logic';

export const handler = async (c: Context) => {
    try {
        const id = c.req.param('id')!;
        const db = c.get('internalDb' as any);
        processDeleteTarget(db, id);
        return c.json({ success: true, message: 'Target system removed' });
    } catch (err: any) {
        let status = 400;
        if (err.message === 'Target system not found') status = 404;
        return c.json({ success: false, error: { message: err.message } }, status as any);
    }
};

