/**
 * Dashboard Environment Configuration
 * 
 * HARDENING v3: API_URL selalu return '/api' (path relatif)
 * sehingga semua request dari browser melewati Next.js Rewrites.
 * Browser TIDAK PERNAH tahu URL backend yang sebenarnya.
 *
 * Cara kerja:
 *   Browser → localhost:3000/api/* → Next.js Rewrite → localhost:3001/api/*  (local)
 *   Browser → lfengine.workers.dev/api/* → Rewrite → backend-worker/api/*   (production)
 *
 * URL backend dikonfigurasi di:
 *   - next.config.ts rewrites (BACKEND_INTERNAL_URL atau NEXT_PUBLIC_API_URL)
 *   - BUKAN di file ini
 */

import { EnvCore } from '@/lib/system-core-env';
import { GitHubEnvDriver } from '@/lib/driver-env-github';

// =========================================
// STATIC ENV (Di-replace Webpack saat build)
// =========================================
const STATIC_ENV: Record<string, string> = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
};

// =========================================
// CUSTOM DRIVER UNTUK NEXT.JS
// =========================================
class NextJsEnvDriver {
    readonly name = 'nextjs-static';
    readonly priority = 1;

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
    envCore.registerDriver(new NextJsEnvDriver());
    envCore.registerDriver(new GitHubEnvDriver());
}

// =========================================
// EXPORT
// =========================================

export const env = {
    /**
     * API URL untuk CLIENT-SIDE (browser).
     * 
     * Di Local (localhost): Pakai '/api' (Next.js Route Handler)
     * Di Production (Cloudflare): Pakai URL backend langsung
     * 
     * Note: OpenNext tidak support Next.js API Routes, jadi di production
     * kita harus直接 call backend URL.
     */
    get API_URL(): string {
        if (typeof window === 'undefined') {
            return '/api';
        }
        
        const isLocalhost = window.location.hostname === 'localhost' 
            || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            return '/api';
        }
        
        // Di production Cloudflare, gunakan backend URL langsung
        // karena OpenNext tidak support API Routes
        return process.env.NEXT_PUBLIC_API_URL || '/api';
    }
};

export { envCore };
