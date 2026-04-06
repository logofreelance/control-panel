'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { AUTH_ROUTES } from '../config/routes';
import { AUTH_UI_LABELS } from '../constants/ui-labels';

export function useAuth() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [status, setStatus] = useState<{ loading?: boolean; message?: string; status?: string } | null>(null);
    const router = useRouter();

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true });

        try {
            console.log("[USE_AUTH] Calling authApi.login...");
            const data = await authApi.login(formData);
            console.log("[USE_AUTH] Login result received:", data);

            if (data.success) {
                console.log("[USE_AUTH] Success! Syncing cookie and redirecting...");
                
                // MANUALLY SET COOKIE ON FRONTEND DOMAIN
                // Ini penting karena domain backend & frontend berbeda di workers.dev
                const SESSION_ID = data.data?.token || (data as any).token;
                if (SESSION_ID) {
                    document.cookie = `auth_session=${SESSION_ID}; path=/; SameSite=Lax; Secure; Max-Age=${60 * 60 * 24 * 30}`;
                }

                router.replace(AUTH_ROUTES.dashboard);
                setTimeout(() => window.location.reload(), 300);
            } else {
                console.log("[USE_AUTH] Login failed (success: false)");
                const message = data.error?.message || data.message || AUTH_UI_LABELS.login.failedToConnect;
                setStatus({ message: `LOGIN FAILED: ${message}`, status: 'error', loading: false });
            }
        } catch (err: any) {
            console.error('[USE_AUTH EXCEPTION]', err);
            const message = err.message || AUTH_UI_LABELS.login.failedToConnect;
            setStatus({ message: `NETWORK ERROR: ${message}`, status: 'error', loading: false });
        }
    }, [formData, router]);

    const handleInputChange = useCallback((key: 'username' | 'password', value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (status?.message) setStatus(null); // Clear error when typing
    }, [status]);

    return {
        formData,
        status,
        handleLogin,
        handleInputChange
    };
}
