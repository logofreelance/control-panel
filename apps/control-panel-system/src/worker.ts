// worker.ts
// Cloudflare Workers Entry Point
// Static Imports (Stable) + Global Try-Catch

import app from './index';
// Import dependencies directly to ensure bundler includes them
import { EnvCore } from '@modular/core-env';
import { GitHubEnvDriver } from '@modular/driver-env-github';

// Setup Global Environment (Outside fetch for performance)
try {
    const envCore = EnvCore.getInstance();
    // Register drivers if not processed yet
    // Note: In Cloudflare global scope runs once per isolate instantiation
    if (envCore.getStatus().drivers.length === 0) {
        envCore.registerDriver(new GitHubEnvDriver());
    }
} catch (e) {
    console.error('[WORKER GLOBAL INIT ERROR]', e);
    // If global init fails, fetch will catch it or runtime will log it
}

export default {
    async fetch(request: Request, env: any, ctx: any) {
        try {
            // 1. Setup Context (Crucial for Cloudflare Bindings)
            const envCore = EnvCore.getInstance();
            envCore.setContext({ env } as any);

            // 2. Delegate to App
            // Hono's app.fetch is robust
            const response = await app.fetch(request, env, ctx);

            // 3. Fallback for 500s that Hono might have missed (paranoid check)
            if (response.status === 500 && !response.headers.get('content-type')?.includes('json')) {
                // If it's a plain text 500 from internal Hono crash allow it, 
                // but we prefer our JSON format from app.onError
                // We can clone and inspect if we really wanted to, but let's trust app.onError
            }

            return response;

        } catch (e: any) {
            console.error('[CRITICAL WORKER FETCH ERROR]', e);
            // 4. Trace the Ultimate Crash
            return new Response(JSON.stringify({
                status: 'critical_worker_error',
                error: 'Worker Execution Failed',
                message: e.message || String(e),
                stack: e.stack,
                url: request.url,
                timestamp: new Date().toISOString()
            }, null, 2), {
                status: 500,
                headers: {
                    'content-type': 'application/json',
                    'access-control-allow-origin': '*'
                }
            });
        }
    }
};
