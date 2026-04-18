/**
 * update-put/handler.ts
 */
import type { Context } from 'hono';
import { processUpdateSettings } from './logic';

export const handler = async (c: Context) => {
    try {
        const body = await c.req.json();
        const db = c.get('internalDb' as any);
        await processUpdateSettings(db, body);
        return c.json({ success: true, message: 'Settings updated successfully' });
    } catch (err: any) {
        return c.json({ success: false, error: { message: err.message } }, 400);
    }
};
