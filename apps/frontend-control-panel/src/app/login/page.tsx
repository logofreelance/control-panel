// TIDAK ada 'use client' — ini Server Component
import { LoginView } from '@/features-internal/feature-auth';

// SSR Note: Di Cloudflare Worker, SSR fetch ke external URL TIDAK bekerja.
// Kita give default values, client-side check akan berjalan di background.
const DEFAULT_SYSTEM = { ready: true, needInstall: false, error: null };
const DEFAULT_BRANDING = { siteName: 'Control Panel', primaryColor: '#3b82f6' };

export default async function LoginPage() {
    // SSR fetch DISABLED karena OpenNext tidak support external fetch
    // Client-side fallback di LoginView akan handle ini
    
    return <LoginView initialSystem={DEFAULT_SYSTEM as any} initialBranding={DEFAULT_BRANDING as any} />;
}
