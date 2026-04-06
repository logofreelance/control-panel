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

    // Safely generate glow effect for both hex and oklch
    let glowValue = primaryColor;
    if (primaryColor.startsWith('#')) {
        glowValue = primaryColor + '26'; // 15% opacity hex
    } else {
        glowValue = `color-mix(in srgb, ${primaryColor}, transparent 85%)`;
    }
    document.documentElement.style.setProperty('--primary-glow', glowValue);
    
    // Sync to both storage layers
    localStorage.setItem('theme_color', primaryColor);
    document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
}


/** Apply theme preset class to <html> */
function applyThemePreset(presetName: string) {
    const html = document.documentElement;
    
    // Remove existing theme classes more safely
    const themeClasses = Array.from(html.classList).filter(c => c.startsWith('theme-'));
    themeClasses.forEach(c => html.classList.remove(c));

    // Remove inline properties IF it's a known preset to avoid conflicts
    if (presetName && presetName !== 'default') {
        html.style.removeProperty('--primary');
        html.style.removeProperty('--primary-glow');
        html.classList.add(`theme-${presetName}`);
    }
    
    // Sync to storage layers
    const finalPreset = presetName || 'default';
    localStorage.setItem('theme_preset', finalPreset);
    document.cookie = `theme_preset=${finalPreset};path=/;max-age=31536000;SameSite=Lax`;
}

import { BRAND } from '@/lib/config';

// ... (apply functions remain same)

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings>(() => {
        if (typeof window !== 'undefined') {
            const storedColor = localStorage.getItem('theme_color');
            const storedPreset = localStorage.getItem('theme_preset');
            return {
                siteName: '',
                siteTitle: '',
                metaDescription: '',
                primaryColor: (storedColor && storedColor !== 'null' ? storedColor : null) || BRAND.PRIMARY_COLOR,
                faviconUrl: '',
                themePreset: (storedPreset && storedPreset !== 'null' ? storedPreset : null) || 'default',
            };
        }
        return {
            siteName: '',
            siteTitle: '',
            metaDescription: '',
            primaryColor: BRAND.PRIMARY_COLOR,
            faviconUrl: '',
            themePreset: 'default',
        };
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await settingsApi.getAll();
            if (res.success && res.data) {
                const newData = res.data;
                
                // IMPORTANT SINK: Only update state if data is valid
                setSettings(newData);
                
                const preset = newData.themePreset || 'default';
                const color = newData.primaryColor;

                // Sync storage IF it's actually a valid theme-related change
                // We use current storage as the ground truth if the API feels "empty"
                const currentPreset = localStorage.getItem('theme_preset');
                const currentColor = localStorage.getItem('theme_color');

                if (preset !== 'default' || currentPreset === 'default') {
                    if (preset !== currentPreset) {
                       applyThemePreset(preset);
                    }
                }
                
                if (color && color !== currentColor) {
                    applyThemeColor(color);
                }
            }
        } catch {
            console.error('[Settings] Failed to load settings from API');
        } finally {
            setLoading(false);
        }
    }, []);



    const saveSettings = useCallback(async (form: SiteSettings): Promise<boolean> => {
        setSaving(true);
        try {
            const res = await settingsApi.update(form);
            if (res.success) {
                setSettings(form);
                
                // Immediately apply and sync
                applyThemePreset(form.themePreset || 'default');
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
