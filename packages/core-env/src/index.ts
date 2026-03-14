/**
 * @modular/core-env
 * 
 * PUSAT ENV - NETRAL
 * 
 * Package ini HANYA menyediakan:
 * 1. EnvCore class - registry untuk drivers
 * 2. Interface IEnvDriver - kontrak untuk semua driver
 * 3. Fungsi helper (getEnv, isDev, isProd)
 * 
 * TIDAK ADA driver built-in. Semua driver ada di package terpisah:
 * - @modular/driver-env-cloudflare
 * - @modular/driver-env-node
 * - @modular/driver-env-github
 */

import type { Context } from 'hono';
import type { IEnvDriver } from '@modular/contracts';
export type { IEnvDriver };



/**
 * Interface untuk ENV values
 */
export interface AppEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    BACKEND_SYSTEM_API_KEY?: string;
    BACKEND_SYSTEM_URL?: string;
    PORT?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_BACKEND_SYSTEM_API?: string;
}

/**
 * EnvCore - Pusat ENV (NETRAL)
 * 
 * Hanya menyediakan registry untuk drivers.
 * Tidak ada driver built-in. App harus register driver sendiri.
 */
export class EnvCore {
    private drivers: IEnvDriver[] = [];
    // private static instance: EnvCore | null = null;
    private context: Context | null = null;

    private constructor() {
        console.log('[DEBUG ENV CORE INSTANTIATED]', new Error().stack?.split('\n')[2]);
    }

    /**
     * Get singleton instance
     * Uses globalThis to survive tsup bundling, CJS/ESM dual packages, and TSX hot-reloads
     */
    static getInstance(): EnvCore {
        if (!(globalThis as any).__ENV_CORE__) {
            (globalThis as any).__ENV_CORE__ = new EnvCore();
        }
        return (globalThis as any).__ENV_CORE__;
    }

    /**
     * Set Hono context (untuk driver yang butuh)
     */
    setContext(c: Context): EnvCore {
        this.context = c;
        return this;
    }

    /**
     * Get current context
     */
    getContext(): Context | null {
        return this.context;
    }

    /**
     * Register driver
     */
    registerDriver(driver: IEnvDriver): void {
        this.drivers.push(driver);
        this.drivers.sort((a, b) => a.priority - b.priority);
        console.log(`[ENV-CORE] Driver registered: ${driver.name} (priority: ${driver.priority})`);
    }

    /**
     * Get ENV value by key
     */
    get<K extends keyof AppEnv>(key: K): AppEnv[K] {
        for (const driver of this.drivers) {
            const value = driver.get(key, this.context);
            if (value !== undefined) {
                return value as AppEnv[K];
            }
        }
        return '' as AppEnv[K];
    }

    /**
     * Get any ENV value by string key
     */
    getRaw(key: string): string | undefined {
        for (const driver of this.drivers) {
            const value = driver.get(key, this.context);
            if (value !== undefined) {
                return value;
            }
        }
        return undefined;
    }

    /**
     * Get all ENV values
     */
    getAll(): AppEnv {
        return {
            DATABASE_URL: this.get('DATABASE_URL'),
            CORS_ORIGIN: this.get('CORS_ORIGIN') || '*',
            JWT_SECRET: this.get('JWT_SECRET'),
            BACKEND_SYSTEM_API_KEY: this.get('BACKEND_SYSTEM_API_KEY'),
            BACKEND_SYSTEM_URL: this.get('BACKEND_SYSTEM_URL'),
            PORT: this.get('PORT'),
            NODE_ENV: (this.get('NODE_ENV') || 'development') as AppEnv['NODE_ENV'],
            NEXT_PUBLIC_API_URL: this.get('NEXT_PUBLIC_API_URL'),
            NEXT_PUBLIC_BACKEND_SYSTEM_API: this.get('NEXT_PUBLIC_BACKEND_SYSTEM_API'),
        };
    }

    /**
     * Check if key exists
     */
    has(key: keyof AppEnv): boolean {
        return this.drivers.some(d => d.has(key, this.context));
    }

    /**
     * Validate required ENV
     */
    validate(): { valid: boolean; missing: string[] } {
        const required: (keyof AppEnv)[] = ['DATABASE_URL', 'JWT_SECRET'];
        const missing = required.filter(key => !this.get(key));
        return { valid: missing.length === 0, missing };
    }

    /**
     * Get status for debugging
     */
    getStatus(): { drivers: string[]; validation: ReturnType<EnvCore['validate']> } {
        return {
            drivers: this.drivers.map(d => `${d.name}:${d.priority}`),
            validation: this.validate(),
        };
    }

    /**
     * Clear all drivers (for testing)
     */
    clearDrivers(): void {
        this.drivers = [];
    }
}

// Helper functions
export function getEnv(c?: Context): AppEnv {
    const core = EnvCore.getInstance();
    if (c) core.setContext(c);
    return core.getAll();
}

export function systemNotReady(c: Context): Response {
    return c.json({
        status: 'error',
        code: 503,
        message: 'System not ready - DATABASE_URL not configured',
    }, 503);
}

export function isDev(c?: Context): boolean {
    return getEnv(c).NODE_ENV === 'development';
}

export function isProd(c?: Context): boolean {
    return getEnv(c).NODE_ENV === 'production';
}

