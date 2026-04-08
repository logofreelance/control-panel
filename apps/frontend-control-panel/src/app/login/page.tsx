// TIDAK ada 'use client' — ini Server Component
import { LoginView } from '@/features-internal/feature-auth';
import { checkSystemServer, fetchBrandingServer } from '@/features-internal/feature-auth/api/auth.server';

export default async function LoginPage() {
    // Server-to-server fetch — URL backend tersembunyi dari browser
    const [systemCheck, branding] = await Promise.all([
        checkSystemServer(),
        fetchBrandingServer(),
    ]);

    return <LoginView initialSystem={systemCheck} initialBranding={branding} />;
}
