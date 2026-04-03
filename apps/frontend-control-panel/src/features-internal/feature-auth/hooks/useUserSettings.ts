'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { AUTH_ROUTES } from '../config/routes';
import { AUTH_UI_LABELS } from '../constants/ui-labels';
import { validatePasswordMatch } from '../services/auth-validation';
import type { AuthUser, FormStatus, ProfileFormData, PasswordFormData } from '../types/auth';

export function useUserSettings() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState<ProfileFormData>({ newUsername: '' });
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profileStatus, setProfileStatus] = useState<FormStatus | null>(null);
    const [passwordStatus, setPasswordStatus] = useState<FormStatus | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authApi.getCurrentUser();
                if (res.success && res.data?.user) {
                    setUser(res.data.user);
                    setProfileData({ newUsername: res.data.user.username });
                }
            } catch (err) {
                console.error('Failed to fetch user:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = useCallback(async () => {
        try { await authApi.logout(); } catch { }
        window.location.href = AUTH_ROUTES.login;
    }, []);

    const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileStatus({ loading: true });
        try {
            const res = await authApi.updateProfile({ newUsername: profileData.newUsername });
            if (res.success) {
                setProfileStatus({ message: AUTH_UI_LABELS.messages.profileUpdated, type: 'success' });
                setUser(prev => prev ? { ...prev, username: profileData.newUsername } : null);
            } else {
                setProfileStatus({ message: res.message || AUTH_UI_LABELS.messages.profileUpdateFailed, type: 'error' });
            }
        } catch (err: any) {
            setProfileStatus({ message: err.message || AUTH_UI_LABELS.messages.errorOccurred, type: 'error' });
        } finally {
            setProfileStatus(prev => prev ? { ...prev, loading: false } : null);
        }
    }, [profileData]);

    const handleChangePassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswordMatch(passwordData.newPassword, passwordData.confirmPassword)) {
            setPasswordStatus({ message: AUTH_UI_LABELS.validation.passwordsDoNotMatch, type: 'error' });
            return;
        }

        setPasswordStatus({ loading: true });
        try {
            const res = await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            if (res.success) {
                setPasswordStatus({ message: AUTH_UI_LABELS.messages.passwordChanged, type: 'success' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordStatus({ message: res.message || AUTH_UI_LABELS.messages.passwordChangeFailed, type: 'error' });
            }
        } catch (err: any) {
            setPasswordStatus({ message: err.message || AUTH_UI_LABELS.messages.errorOccurred, type: 'error' });
        } finally {
            setPasswordStatus(prev => prev ? { ...prev, loading: false } : null);
        }
    }, [passwordData]);

    return {
        user,
        loading,
        profileData,
        setProfileData,
        passwordData,
        setPasswordData,
        profileStatus,
        passwordStatus,
        handleLogout,
        handleUpdateProfile,
        handleChangePassword,
    };
}
