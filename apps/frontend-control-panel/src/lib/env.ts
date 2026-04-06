/**
 * Dashboard Environment Configuration
 * 
 * KHUSUS NEXT.JS: NEXT_PUBLIC_* harus diakses secara STATIC
 * agar Webpack bisa replace saat build time.
 * 
 * Tetap menggunakan pattern core-env + driver,
 * tapi dengan static object yang di-define di sini.
 */

import { EnvCore } from '@/lib/system-core-env';
import { GitHubEnvDriver } from '@/lib/driver-env-github';

// =========================================
// STATIC ENV (Di-replace Webpack saat build)
// =========================================
// Next.js HANYA bisa replace process.env.NEXT_PUBLIC_* yang LITERAL
// Dynamic access process.env[key] TIDAK BEKERJA di browser
const STATIC_ENV: Record<string, string> = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
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
    ? ['localhost', '127.0.0.1'].includes(window.location.hostname) || /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname)
    : process.env.NODE_ENV === 'development';

// Dynamic fallback: use the current hostname so it works from localhost AND LAN IP
const getLocalApiUrl = () => {
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:3001/api`;
    }
    return 'http://localhost:3001/api';
};

export const env = {
    get API_URL() {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            // Jika berjalan di cloudflare workers dev
            if (hostname.endsWith('.workers.dev')) {
                // Point ke backend-control-panel.logofreelance-com.workers.dev
                return 'https://backend-control-panel.logofreelance-com.workers.dev/api';
            }
        }

        const value = envCore.get('NEXT_PUBLIC_API_URL');
        if (!value) {
            if (isLocalDev) {
                return getLocalApiUrl();
            }
            return '/api';
        }
        return value;
    }
};

export { envCore };
