/**
 * list-get/handler.ts
 */
import type { Context } from 'hono';
import * as model from './model';

export const handler = async (c: Context) => {
    try {
        const db = c.get('internalDb' as any);
        const list = await model.findAllTargetSystemsSafe(db);
        return c.json({ success: true, data: list });
    } catch (err: any) {
        return c.json({ success: false, error: { message: err.message } }, 500);
    }
};
