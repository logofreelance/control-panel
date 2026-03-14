/**
 * Dashboard Environment Configuration
 * 
 * KHUSUS NEXT.JS: NEXT_PUBLIC_* harus diakses secara STATIC
 * agar Webpack bisa replace saat build time.
 * 
 * Tetap menggunakan pattern core-env + driver,
 * tapi dengan static object yang di-define di sini.
 */

import { EnvCore } from '@modular/core-env';
import { GitHubEnvDriver } from '@modular/driver-env-github';

// =========================================
// STATIC ENV (Di-replace Webpack saat build)
// =========================================
// Next.js HANYA bisa replace process.env.NEXT_PUBLIC_* yang LITERAL
// Dynamic access process.env[key] TIDAK BEKERJA di browser
const STATIC_ENV: Record<string, string> = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_BACKEND_SYSTEM_API: process.env.NEXT_PUBLIC_BACKEND_SYSTEM_API || '',
};

// =========================================
// CUSTOM DRIVER UNTUK NEXT.JS
// =========================================
class NextJsEnvDriver {
    readonly name = 'nextjs-static';
    readonly priority = 1; // Highest priority

    get(key: string): string | undefined {
        return STATIC_ENV[key];
    }

    has(key: string): boolean {
        return key in STATIC_ENV && !!STATIC_ENV[key];
    }
}

// =========================================
// REGISTER DRIVER
// =========================================
const envCore = EnvCore.getInstance();

if (envCore.getStatus().drivers.length === 0) {
    // 1. NextJs Static Driver (untuk NEXT_PUBLIC_*)
    envCore.registerDriver(new NextJsEnvDriver());
    // 2. GitHub Driver sebagai fallback (untuk server-side/SSR)
    envCore.registerDriver(new GitHubEnvDriver());
}

// =========================================
// EXPORT
// =========================================

// Detection for development mode (more reliable than NODE_ENV in Next.js)
const isLocalDev = typeof window !== 'undefined'
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    : process.env.NODE_ENV === 'development';

// Fallback URLs for local development (must include /orange and /green prefixes)
const LOCAL_FALLBACKS = {
    API_BASE: 'http://localhost:3000/api',
    BACKEND_SYSTEM_API: 'http://localhost:3002/backend-system',
};

export const env = {
    get API_URL() {
        return envCore.get('NEXT_PUBLIC_API_URL') || '';
    },

    get API_BASE() {
        const value = envCore.get('NEXT_PUBLIC_API_URL');
        if (!value) {
            // In local dev, use fallback; in production, throw
            if (isLocalDev) {
                console.warn('[ENV] NEXT_PUBLIC_API_URL not set, using localhost fallback');
                return LOCAL_FALLBACKS.API_BASE;
            }
            throw new Error('NEXT_PUBLIC_API_URL is missing');
        }
        return value;
    },

    get BACKEND_SYSTEM_API() {
        const value = envCore.get('NEXT_PUBLIC_BACKEND_SYSTEM_API');
        if (!value) {
            // In local dev, use fallback; in production, throw
            if (isLocalDev) {
                console.warn('[ENV] NEXT_PUBLIC_BACKEND_SYSTEM_API not set, using localhost fallback');
                return LOCAL_FALLBACKS.BACKEND_SYSTEM_API;
            }
            throw new Error('NEXT_PUBLIC_BACKEND_SYSTEM_API is missing');
        }
        return value;
    },
};

export { envCore };
