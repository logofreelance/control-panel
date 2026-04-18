/**
 * test-connection-post/handler.ts
 */
import type { Context } from 'hono';
import { testDatabaseConnection } from './logic';

export const handler = async (c: Context) => {
    try {
        const { databaseUrl } = await c.req.json();
        if (!databaseUrl) return c.json({ success: false, error: { message: 'Database URL is required' } }, 400);

        const result = await testDatabaseConnection(databaseUrl);
        return c.json({ success: true, data: result });
    } catch (err: any) {
        return c.json({ success: false, error: { message: err.message } }, 500);
    }
};
