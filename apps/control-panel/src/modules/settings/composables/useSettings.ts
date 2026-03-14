/**
 * settings/composables/useSettings.ts
 * 
 * Composable for site settings management
 * PURE DI: Uses @cp/config labels and API from local api/
 */

import { useState, useEffect, useCallback } from 'react';
import { SETTINGS_LABELS } from '@cp/settings-manager';
import { useToast, usePageLoading } from '@/modules/_core';
import { getSettingsTranslation } from '@cp/config';
import { fetchWithCsrf } from '@/lib/csrf';
import { API } from '../api';
import type { SiteSettings, ApiResponse } from '../types';

const MSG = SETTINGS_LABELS.messages;
const t = getSettingsTranslation;

// Helper to apply theme color to CSS variables
function applyThemeColor(primaryColor: string) {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-glow', primaryColor + '26');
    // Update cookie for persistence
    document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
}

export function useSettings() {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: '',
        siteTitle: '',
        metaDescription: '',
        primaryColor: '#3B82F6', // Default blue
        faviconUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchSettings = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetch(API.settings, {
                credentials: 'include'
            });
            const data: ApiResponse<SiteSettings> = await res.json();
            if (data.status === 'success' && data.data) {
                setSettings(data.data);
                document.cookie = `site_settings=${encodeURIComponent(JSON.stringify(data.data))};path=/;max-age=31536000;SameSite=Lax`;
            }
        } catch {
            addToast(t(MSG.loadFailed), 'error');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [addToast]);

    const saveSettings = useCallback(async (form: SiteSettings) => {
        setSaving(true);
        try {
            const res = await fetchWithCsrf(API.settings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data: ApiResponse<null> = await res.json();
            if (data.status === 'success') {
                // Apply color immediately without refetch
                if (form.primaryColor) {
                    applyThemeColor(form.primaryColor);
                }
                document.cookie = `site_settings=${encodeURIComponent(JSON.stringify(form))};path=/;max-age=31536000;SameSite=Lax`;
                addToast(t(MSG.saveSuccess), 'success');
                return true;
            } else {
                addToast(data.message || t(MSG.saveFailed), 'error');
                return false;
            }
        } catch {
            addToast(t(MSG.connectionFailed), 'error');
            return false;
        } finally {
            setSaving(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        setSettings,
        loading,
        saving,
        saveSettings,
        refresh: fetchSettings,
    };
}
