/**
 * create-post/handler.ts
 */
import type { Context } from 'hono';
import { processCreateAdminUser } from './logic';

export const handler = async (c: Context) => {
    try {
        const { username, password, role } = await c.req.json();
        const db = c.get('internalDb' as any);
        const newUser = await processCreateAdminUser(db, username, password, role);
        return c.json({ status: 'success', data: newUser });
    } catch (err: any) {
        return c.json({ status: 'error', message: err.message }, 400);
    }
};
