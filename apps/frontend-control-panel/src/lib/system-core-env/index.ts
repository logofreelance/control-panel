/**
 * @repo/system-core-env
 * 
 * PUSAT ENV - NETRAL
 * 
 * Package ini HANYA menyediakan:
 * 1. EnvCore class - registry untuk drivers
 * 2. Interface IEnvDriver - kontrak untuk semua driver
 * 3. Fungsi helper (getEnv, isDev, isProd)
 * 
 * TIDAK ADA driver built-in. Semua driver ada di package terpisah:
 * - @repo/driver-env-cloudflare
 * - @repo/driver-env-node
 * - @repo/driver-env-github
 */

import type { Context } from 'hono';
import type { IEnvDriver } from '@/lib/contracts';
export type { IEnvDriver };



/**
 * Interface untuk ENV values
 */
export interface AppEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    GREEN_API_KEY?: string;
    GREEN_INTERNAL_URL?: string;
    ORANGE_PORT?: string;
    GREEN_PORT?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL?: string;
}

/**
 * EnvCore - Pusat ENV (NETRAL)
 * 
 * Hanya menyediakan registry untuk drivers.
 * Tidak ada driver built-in. App harus register driver sendiri.
 */
export class EnvCore {
    private drivers: IEnvDriver[] = [];
    private static instance: EnvCore | null = null;
    private context: Context | null = null;

    private constructor() { }

    /**
     * Get singleton instance
     */
    static getInstance(): EnvCore {
        if (!EnvCore.instance) {
            EnvCore.instance = new EnvCore();
        }
        return EnvCore.instance;
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
            GREEN_API_KEY: this.get('GREEN_API_KEY'),
            GREEN_INTERNAL_URL: this.get('GREEN_INTERNAL_URL'),
            ORANGE_PORT: this.get('ORANGE_PORT'),
            GREEN_PORT: this.get('GREEN_PORT'),
            NODE_ENV: (this.get('NODE_ENV') || 'development') as AppEnv['NODE_ENV'],
            NEXT_PUBLIC_API_URL: this.get('NEXT_PUBLIC_API_URL'),
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
