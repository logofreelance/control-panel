/**
 * list-get/handler.ts
 */
import type { Context } from 'hono';
import * as model from './model';

export const handler = async (c: Context) => {
    try {
        const db = c.get('internalDb' as any);
        const rows = await model.getAdminUsersList(db);
        return c.json({ status: 'success', data: rows });
    } catch (err: any) {
        return c.json({ status: 'error', message: err.message }, 500);
    }
};
