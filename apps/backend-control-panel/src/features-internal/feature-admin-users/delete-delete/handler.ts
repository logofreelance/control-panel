/**
 * delete-delete/handler.ts
 */
import type { Context } from 'hono';
import * as model from './model';

export const handler = async (c: Context) => {
    try {
        const id = c.req.param('id')!;
        const db = c.get('internalDb' as any);
        await model.deleteAdminUser(db, id);
        return c.json({ status: 'success', message: 'Admin deleted' });
    } catch (err: any) {
        return c.json({ status: 'error', message: err.message }, 500);
    }
};

