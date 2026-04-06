import { config } from 'dotenv';
import path from 'path';

export interface EnvironmentConfig {
    DATABASE_URL_INTERNAL_CONTROL_PANEL: string;
    JWT_SECRET: string;
    NODE_ENV: string;
    BACKEND_CONTROL_PANEL_PORT: number;
}

let cachedEnv: EnvironmentConfig | null = null;

export function loadEnvironmentConfig(cloudflareBindings?: Record<string, any>): EnvironmentConfig {
    const useCloudflare = !!(cloudflareBindings && Object.keys(cloudflareBindings).length > 0);

    if (cachedEnv && !useCloudflare) {
        return cachedEnv;
    }

    if (process.env.NODE_ENV !== 'production' && !useCloudflare) {
        const potentialPaths = [
            path.join(__dirname, '.env'),
            path.join(__dirname, '..', '.env'),
            path.join(__dirname, '../..', '.env'),
            path.join(process.cwd(), '.env'),
            path.join(process.cwd(), 'control-panel/apps/backend-control-panel', '.env')
        ];

        let loaded = false;
        for (const envPath of potentialPaths) {
            const result = config({ path: envPath, override: true });
            if (!result.error && process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL) {
                console.log('[ENV-LOADER] ✅ Loaded .env from:', envPath);
                loaded = true;
                break;
            }
        }

        if (!loaded) {
            console.warn('[ENV-LOADER] ⚠️ Could not find a valid .env file in potential locations.');
        }
    }

    const source = useCloudflare ? cloudflareBindings! : process.env;

    const env: EnvironmentConfig = {
        DATABASE_URL_INTERNAL_CONTROL_PANEL: source.DATABASE_URL_INTERNAL_CONTROL_PANEL || '',
        JWT_SECRET: source.JWT_SECRET || 'dev-secret-key-123',
        NODE_ENV: source.NODE_ENV || 'development',
        BACKEND_CONTROL_PANEL_PORT: parseInt(source.BACKEND_CONTROL_PANEL_PORT || source.PORT || '3001', 10),
    };

    if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) {
        throw new Error('FATAL: DATABASE_URL_INTERNAL_CONTROL_PANEL is completely missing. Cannot start control panel without its own DB.');
    }

    if (!useCloudflare) {
        cachedEnv = env;
    }

    return env;
}
