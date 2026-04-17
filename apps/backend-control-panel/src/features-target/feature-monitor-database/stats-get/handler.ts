/**
 * stats-get/handler.ts
 */

import { Context } from 'hono';
import * as logic from './logic';

export const handler = async (c: Context) => {
    try {
        const db = c.get('targetDb');
        if (!db) {
            return c.json({ status: 'error', message: 'Target database connection not established' }, 400);
        }

        const data = await logic.getDatabaseMetrics(db);
        return c.json({ status: 'success', data });
    } catch (err: any) {
        console.error("[STATS-GET-ERROR]", err);
        return c.json({ status: 'error', message: err.message }, 500);
    }
};
