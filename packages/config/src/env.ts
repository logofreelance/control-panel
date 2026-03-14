// packages/config/src/env.ts
// Environment configuration with Cloudflare Workers support
//
// MIGRATION: This file now re-exports from @cp/core-env
// All existing imports from @cp/config will continue to work

// Re-export everything from system-core-env
export {
    EnvCore,
    getEnv,
    systemNotReady,
    isDev,
    isProd,
    type AppEnv,
    type IEnvDriver,
} from '@modular/core-env';

// Additional utilities for backward compatibility
import type { Context } from 'hono';
import { getEnv } from '@modular/core-env';

/**
 * Get environment variables and throw if required ones are missing
 * Use this when env vars are required for the operation
 * 
 * @param c - Hono context
 * @throws Error if DATABASE_URL or JWT_SECRET is missing
 */
export function requireEnv(c?: Context) {
    const env = getEnv(c);
    const missing: string[] = [];

    if (!env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!env.JWT_SECRET) missing.push('JWT_SECRET');

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return env;
}

/**
 * Validate environment configuration
 * @returns Validation result with list of missing variables
 */
export function validateEnv(c?: Context): { valid: boolean; missing: string[] } {
    const env = getEnv(c);
    const missing: string[] = [];

    if (!env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!env.JWT_SECRET) missing.push('JWT_SECRET');

    return { valid: missing.length === 0, missing };
}
