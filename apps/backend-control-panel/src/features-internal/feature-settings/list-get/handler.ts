/**
 * list-get/handler.ts
 */
import type { Context } from 'hono';
import * as model from './model';

import { settingsStore } from '../settings.store';

export const handler = async (c: Context) => {
    try {
        const settings = settingsStore.get();
        return c.json({ success: true, data: settings });
    } catch (err: any) {
        return c.json({ success: false, error: { message: err.message } }, 500);
    }
};
