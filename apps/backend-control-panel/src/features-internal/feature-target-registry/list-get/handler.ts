/**
 * list-get/handler.ts
 */
import type { Context } from 'hono';
import * as model from './model';

import { targetStore } from '../target.store';

export const handler = async (c: Context) => {
    try {
        const list = targetStore.getAll();
        return c.json({ success: true, data: list });
    } catch (err: any) {
        return c.json({ success: false, error: { message: err.message } }, 500);
    }
};
