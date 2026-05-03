'use client';

import { useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { AUTH_ROUTES } from '../config/routes';
import { AUTH_UI_LABELS } from '../constants/ui-labels';
import { GlobalLoading } from '@/modules/_core/providers/PageLoadingProvider';

export function useAuth() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [status, setStatus] = useState<{ loading?: boolean; message?: string; status?: string } | null>(null);

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true });

        try {
            // Clear any stale session cookie before login attempt
            document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

            const data = await authApi.login(formData);

            if (data.success && data.data?.token) {
                // Set cookie manually — needed because Next.js API proxy may not always
                // forward Set-Cookie headers reliably in development mode.
                // Align max-age with Lucia's sessionExpiresIn (30 days = 2592000 seconds).
                const isSecure = window.location.protocol === 'https:';
                const cookieFlags = `path=/; max-age=2592000; SameSite=Lax${isSecure ? '; Secure' : ''}`;
                document.cookie = `auth_session=${data.data.token}; ${cookieFlags}`;
                
                // Lock loading overlay BEFORE redirect to prevent flash
                GlobalLoading.lock();
                window.location.href = AUTH_ROUTES.dashboard;
                return; // Don't execute anything after redirect
            } else {
                const message = data.error?.message || data.message || AUTH_UI_LABELS.login.failedToConnect;
                setStatus({ message: `LOGIN FAILED: ${message}`, status: 'error', loading: false });
            }
        } catch (err: any) {
            console.error('[USE_AUTH EXCEPTION]', err);
            const message = err.message || AUTH_UI_LABELS.login.failedToConnect;
            setStatus({ message: `NETWORK ERROR: ${message}`, status: 'error', loading: false });
        }
    }, [formData]);

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

