import { parse } from 'dotenv';
import path from 'path';
import fs from 'fs';

export interface EnvironmentConfig {
    DATABASE_URL_INTERNAL_CONTROL_PANEL: string;
    JWT_SECRET: string;
    NODE_ENV: string;
    BACKEND_CONTROL_PANEL_PORT: number;
}

/**
 * Driver Driver Otomatis (Pola Perkasa): 
 * Menangani pembersihan BOM dan pencarian path absolut untuk Windows/Monorepo.
 */
export function loadEnvironmentConfig(cloudflareBindings?: any): EnvironmentConfig {
    const isCloudflare = !!(cloudflareBindings && Object.keys(cloudflareBindings).length > 0);
    
    if (!isCloudflare) {
        const potentialPaths = [
            path.join(process.cwd(), '.env'),
            path.join(process.cwd(), 'control-panel/apps/backend-control-panel', '.env'),
            path.join(__dirname, '../.env')
        ];

        for (const envPath of potentialPaths) {
            if (fs.existsSync(envPath)) {
                try {
                    const content = fs.readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
                    const parsed = parse(content);
                    for (const key in parsed) {
                        process.env[key.trim()] = parsed[key].trim();
                    }
                    break;
                } catch (e: any) {}
            }
        }
    }

    const source: any = isCloudflare ? cloudflareBindings : process.env;

    // Direct extraction dari environment variables
    const dbUrl = (source['DATABASE_URL_INTERNAL_CONTROL_PANEL'] || process.env['DATABASE_URL_INTERNAL_CONTROL_PANEL'] || '').toString();
    if (!dbUrl) {
        throw new Error('DATABASE_URL_INTERNAL_CONTROL_PANEL environment variable is required');
    }

    return {
        DATABASE_URL_INTERNAL_CONTROL_PANEL: dbUrl,
        JWT_SECRET: (source['JWT_SECRET'] || 'dev-secret-key-123').toString(),
        NODE_ENV: (source['NODE_ENV'] || 'development').toString(),
        BACKEND_CONTROL_PANEL_PORT: parseInt((source['BACKEND_CONTROL_PANEL_PORT'] || source['PORT'] || '3001').toString(), 10),
    };
}
