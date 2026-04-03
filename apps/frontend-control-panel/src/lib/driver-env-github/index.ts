
import { IEnvDriver } from '@/lib/contracts';
import type { Context } from 'hono';

/**
 * GitHub ENV Driver
 * 
 * 1. Reads from Runtime Context Env if available (deployed)
 * 2. Reads from process.env (local/build time)
 * 
 * Priority: 5 (Standard)
 */
export class GitHubEnvDriver implements IEnvDriver {
    readonly name = 'github-env';
    readonly priority = 5;

    constructor() { }

    get(key: string, context?: any): string | undefined {
        // 1. Coba check Runtime Context (Cloudflare bindings)
        if (context && typeof context === 'object') {
            // Hono Context .env
            if ('env' in context && context.env && typeof context.env === 'object') {
                const val = (context.env as any)[key];
                if (val !== undefined && val !== null) return String(val);
            }
        }

        // 2. Fallback ke process.env
        return process.env[key];
    }

    has(key: string, context?: any): boolean {
        return this.get(key, context) !== undefined;
    }
}
