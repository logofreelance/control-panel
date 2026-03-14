/**
 * orange/storage/routes.ts
 * 
 * Storage routes
 * DIRECT INSTANTIATION: Cloudflare Workers compatible
 * Mounted at: /orange/storage
 */

import { Hono } from 'hono';
import { StorageHonoHandlers, StorageService } from '@cp/storage-manager';
import { DrizzleStorageRepository } from '../../repositories/system-storage/storage';
import { getEnv, systemNotReady } from '@cp/config';

type Variables = {
    handlers: StorageHonoHandlers;
};

export const storageRouter = new Hono<{ Variables: Variables }>();

storageRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env || !env.DATABASE_URL) return systemNotReady(c);

    try {
        // Full chain: db → repository → service → handlers
        // Direct instantiation of Drizzle Repository
        const repo = new DrizzleStorageRepository(env.DATABASE_URL);
        const service = new StorageService(repo);
        const handlers = new StorageHonoHandlers(service);
        c.set('handlers', handlers);
    } catch (err: any) {
        console.error('[STORAGE] Service init error:', err);
        return c.json({ status: 'error', message: err.message }, 500);
    }

    await next();
});

const getHandlers = (c: any) => c.get('handlers') as StorageHonoHandlers;

// GET /stats - Database Statistics
storageRouter.get('/stats', (c) => getHandlers(c).getStats(c));

// POST /cleanup - Cleanup orphaned data
storageRouter.post('/cleanup', (c) => getHandlers(c).cleanup(c));

// DELETE /tables/:name - Delete a table
storageRouter.delete('/tables/:name', (c) => getHandlers(c).deleteTable(c));
