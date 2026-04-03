'use client';

/**
 * feature-settings — React Hook (simetri style)
 * Applies full theme: CSS variables + preset classes.
 */

import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../api/settings.api';
import type { SiteSettings } from '../types/settings.types';

/** Apply primary color to CSS custom properties */
function applyThemeColor(primaryColor: string) {
    if (!primaryColor) return;
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-glow', primaryColor + '26');
    
    // Sync to both storage layers
    localStorage.setItem('theme_color', primaryColor);
    document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
}

/** Apply theme preset class to <html> */
function applyThemePreset(presetName: string) {
    // Clear manual inline primary color to let the preset take over
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-glow');
    
    document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, '')
        .trim();
    if (presetName && presetName !== 'default') {
        document.documentElement.classList.add(`theme-${presetName}`);
    }
    
    // Sync to both storage layers
    localStorage.setItem('theme_preset', presetName || 'default');
    document.cookie = `theme_preset=${presetName || 'default'};path=/;max-age=31536000;SameSite=Lax`;
}

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: '',
        siteTitle: '',
        metaDescription: '',
        primaryColor: '#FF4136',
        faviconUrl: '',
        themePreset: 'default',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await settingsApi.getAll();
            if (res.success && res.data) {
                // Restore theme from localStorage as fallback if backend misses it
                const storedTheme = localStorage.getItem('theme_preset');
                const mergedData = { ...res.data };
                if (storedTheme && (!res.data.themePreset || res.data.themePreset === 'default')) {
                    mergedData.themePreset = storedTheme;
                }
                
                setSettings(mergedData);
                
                // ORDER MATTERS: Apply Preset FIRST, then Color Override
                if (mergedData.themePreset) {
                    applyThemePreset(mergedData.themePreset);
                }
                if (mergedData.primaryColor) {
                    applyThemeColor(mergedData.primaryColor);
                }
            }
        } catch {
            console.error('[Settings] Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveSettings = useCallback(async (form: SiteSettings): Promise<boolean> => {
        setSaving(true);
        try {
            // Save to localStorage as redundancy
            if (form.themePreset) {
                localStorage.setItem('theme_preset', form.themePreset);
            }
            if (form.primaryColor) {
                localStorage.setItem('theme_color', form.primaryColor);
            }
            
            const res = await settingsApi.update(form);
            if (res.success) {
                // ORDER MATTERS: Apply Preset FIRST, then Color Override
                if (form.themePreset) {
                    applyThemePreset(form.themePreset);
                }
                if (form.primaryColor) {
                    applyThemeColor(form.primaryColor);
                }
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

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
        applyThemeColor,
        applyThemePreset,
    };
}
