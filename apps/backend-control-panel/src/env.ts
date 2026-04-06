import { config } from 'dotenv';
import path from 'path';

export interface EnvironmentConfig {
    DATABASE_URL_INTERNAL_CONTROL_PANEL: string;
    JWT_SECRET: string;
    NODE_ENV: string;
    BACKEND_CONTROL_PANEL_PORT: number;
}

/**
 * Driver Otomatis: Mendeteksi Cloudflare atau Node.js secara transparan
 */
export function loadEnvironmentConfig(cloudflareBindings?: any): EnvironmentConfig {
    const isCloudflare = !!(cloudflareBindings && Object.keys(cloudflareBindings).length > 0);
    
    // Jika di lokal Node.js, pastikan .env terload
    if (!isCloudflare) {
        config(); // Default load .env di CWD
        // Fallback pencarian manual jika .env tidak di CWD
        config({ path: path.join(process.cwd(), 'control-panel/apps/backend-control-panel', '.env'), override: true });
    }

    const source = isCloudflare ? cloudflareBindings : process.env;

    return {
        DATABASE_URL_INTERNAL_CONTROL_PANEL: source.DATABASE_URL_INTERNAL_CONTROL_PANEL || '',
        JWT_SECRET: source.JWT_SECRET || 'dev-secret-key-123',
        NODE_ENV: source.NODE_ENV || 'development',
        BACKEND_CONTROL_PANEL_PORT: parseInt(source.BACKEND_CONTROL_PANEL_PORT || source.PORT || '3001', 10),
    };
}
