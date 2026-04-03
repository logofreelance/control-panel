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
            const data = await authApi.login(formData);
            if (data.success) {
                router.push(AUTH_ROUTES.dashboard);
                router.refresh();
            } else {
                setStatus({ message: data.error?.message || data.message || AUTH_UI_LABELS.login.failedToConnect, status: 'error' });
            }
        } catch (err: any) {
            setStatus({ message: err.message || AUTH_UI_LABELS.login.failedToConnect, status: 'error' });
        }
    }, [formData, router]);

    return {
        formData,
        setFormData,
        status,
        handleLogin,
    };
}
