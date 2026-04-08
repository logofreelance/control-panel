// auth.server.ts — Server-only. TIDAK 'use client'.
// Di-import oleh page.tsx (Server Component), BUKAN oleh Client Component.
// Kompatibel: Node.js (local dev) + Cloudflare Worker (@opennextjs/cloudflare)

/**
 * Resolve backend URL untuk server-side fetch.
 * Priority: BACKEND_INTERNAL_URL → NEXT_PUBLIC_API_URL → localhost fallback
 *
 * AMAN karena:
 * - File ini hanya berjalan di server (Node.js atau Cloudflare Worker runtime)
 * - URL tidak pernah dikirim ke browser
 * - process.env tanpa NEXT_PUBLIC_ prefix tidak di-bundle oleh Webpack
 */
function getBackendUrl(): string {
    // Di SSR konteks Cloudflare Worker, process.env tidak tersedia
    // Kita gunakan URL langsung yang sudah diketahui
    // Saat production → backend worker URL
    // Saat local dev → localhost
    
    return 'https://backend-control-panel.logofreelance-com.workers.dev';
}

// ======================================================
// TYPES — Hanya data yang dibutuhkan UI, tidak lebih
// ======================================================

export interface SystemCheckResult {
    ready: boolean;
    needInstall: boolean;
    error: string | null;
}

export interface BrandingResult {
    siteName: string;
    primaryColor: string;
}

// ======================================================
// SERVER FETCHERS
// ======================================================

/**
 * Check system readiness dari backend (server-to-server).
 * Browser tidak pernah tahu URL backend.
 */
export async function checkSystemServer(): Promise<SystemCheckResult> {
    try {
        const url = `${getBackendUrl()}/api/system-status`;
        console.log(`[AUTH_SERVER] Checking system status: ${url}`);
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();

        // DATA MINIMIZATION: Transform ke format minimal untuk UI
        if (!data.hasDbUrl || !data.isDbConnected) {
            return { ready: false, needInstall: false, error: 'database not available' };
        }
        if (!data.isAdminCreated) {
            return { ready: false, needInstall: true, error: null };
        }
        return { ready: true, needInstall: false, error: null };
    } catch (err) {
        console.error('[AUTH_SERVER] System check failed:', err);
        return { ready: false, needInstall: false, error: 'backend unreachable' };
    }
}

/**
 * Fetch branding/settings dari backend (server-to-server).
 * Hanya mengambil siteName dan primaryColor untuk login page.
 */
export async function fetchBrandingServer(): Promise<BrandingResult | null> {
    try {
        const url = `${getBackendUrl()}/api/settings`;
        console.log(`[AUTH_SERVER] Fetching branding: ${url}`);
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if ((data.status === 'success' || data.success) && data.data) {
            return {
                siteName: data.data.siteName || '',
                primaryColor: data.data.primaryColor || '',
            };
        }
        return null;
    } catch (err) {
        console.error('[AUTH_SERVER] Branding fetch failed:', err);
        return null;
    }
}
