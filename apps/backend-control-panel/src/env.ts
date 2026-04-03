import { config } from 'dotenv';
import path from 'path';

export interface EnvironmentConfig {
    DATABASE_URL_INTERNAL_CONTROL_PANEL: string;
    DATABASE_URL_TARGET_BACKEND_SYSTEM: string;
    JWT_SECRET: string;
    NODE_ENV: string;
    ORANGE_PORT: number;
}

let cachedEnv: EnvironmentConfig | null = null;

export function loadEnvironmentConfig(cloudflareBindings?: Record<string, any>): EnvironmentConfig {
    if (cachedEnv && !cloudflareBindings) {
        return cachedEnv;
    }

    if (process.env.NODE_ENV !== 'production' && !cloudflareBindings) {
        config({ path: path.resolve(process.cwd(), '.env') });
    }

    const source = cloudflareBindings || process.env;

    const env: EnvironmentConfig = {
        DATABASE_URL_INTERNAL_CONTROL_PANEL: source.DATABASE_URL_INTERNAL_CONTROL_PANEL || '',
        DATABASE_URL_TARGET_BACKEND_SYSTEM: source.DATABASE_URL_TARGET_BACKEND_SYSTEM || '',
        JWT_SECRET: source.JWT_SECRET || 'dev-secret-key-123',
        NODE_ENV: source.NODE_ENV || 'development',
        ORANGE_PORT: parseInt(source.ORANGE_PORT || '3001', 10),
    };

    if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) {
        throw new Error('FATAL: DATABASE_URL_INTERNAL_CONTROL_PANEL is completely missing. Cannot start control panel without its own DB.');
    }

    if (!env.DATABASE_URL_TARGET_BACKEND_SYSTEM) {
        throw new Error('FATAL: DATABASE_URL_TARGET_BACKEND_SYSTEM is missing. Control panel cannot manage backend routes.');
    }

    if (!cloudflareBindings) {
        cachedEnv = env;
    }

    return env;
}
