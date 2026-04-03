// worker.ts
// Cloudflare Workers Entry Point (Flat Architecture)

import app from './index';

export default {
    async fetch(request: Request, env: any, ctx: any) {
        try {
            // Inject CF env bindings into process.env for uniform access
            if (env.DATABASE_URL_INTERNAL_CONTROL_PANEL) {
                (globalThis as any).process = (globalThis as any).process || { env: {} };
                (globalThis as any).process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL = env.DATABASE_URL_INTERNAL_CONTROL_PANEL;
                (globalThis as any).process.env.DATABASE_URL_TARGET_BACKEND_SYSTEM = env.DATABASE_URL_TARGET_BACKEND_SYSTEM;
            }

            return await app.fetch(request, env, ctx);
        } catch (e: any) {
            console.error('[CRITICAL WORKER FETCH ERROR]', e);
            return new Response(JSON.stringify({
                status: 'critical_worker_error',
                error: 'Worker Execution Failed',
                message: e.message || String(e),
                timestamp: new Date().toISOString()
            }, null, 2), {
                status: 500,
                headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
            });
        }
    }
};
