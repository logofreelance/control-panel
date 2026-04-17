/**
 * test-get/handler.ts
 */

import { Context } from 'hono';
import * as model from './model';

export const handler = async (c: Context) => {
    try {
        const db = c.get('targetDb');
        if (!db) {
            return c.json({ status: 'error', message: 'Target database connection not established' }, 400);
        }

        const res = await model.testConnection(db);
        return c.json({ status: 'success', data: res });
    } catch (err: any) {
        console.error("[TEST-GET-ERROR]", err);
        return c.json({ status: 'error', message: err.message }, 500);
    }
};
