'use client';

/**
 * feature-settings — React Hook (simetri style)
 * Applies full theme: CSS variables + preset classes.
 */

import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../api/settings.api';
import type { SiteSettings } from '../types/settings.types';

/** Apply primary color to CSS custom properties */
function applyThemeColor(primaryColor: string, persist = false) {
    if (!primaryColor) return;
    
    document.documentElement.style.setProperty('--primary', primaryColor);

    let glowValue = primaryColor;
    if (primaryColor.startsWith('#')) {
        glowValue = primaryColor + '26';
    } else {
        glowValue = `color-mix(in srgb, ${primaryColor}, transparent 85%)`;
    }
    document.documentElement.style.setProperty('--primary-glow', glowValue);
    
    if (persist) {
        localStorage.setItem('theme_color', primaryColor);
        document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
    }
}


/** Apply theme preset class to <html> */
function applyThemePreset(presetName: string, persist = false) {
    const html = document.documentElement;
    const themeClasses = Array.from(html.classList).filter(c => c.startsWith('theme-'));
    themeClasses.forEach(c => html.classList.remove(c));

    if (presetName && presetName !== 'default') {
        html.style.removeProperty('--primary');
        html.style.removeProperty('--primary-glow');
        html.classList.add(`theme-${presetName}`);
    }
    
    if (persist) {
        const finalPreset = presetName || 'default';
        localStorage.setItem('theme_preset', finalPreset);
        document.cookie = `theme_preset=${finalPreset};path=/;max-age=31536000;SameSite=Lax`;
    }
}

import { BRAND } from '@/lib/config';

// ... (apply functions remain same)

import { useSettingsContext } from '../contexts/SettingsContext';

export function useSettings() {
    const { settings, updateSettings } = useSettingsContext();

    const saveSettings = (form: SiteSettings) => {
        // 1. Apply theme visually AND persist to cookies/localStorage
        if (form.themePreset) applyThemePreset(form.themePreset, true);
        if (form.primaryColor) applyThemeColor(form.primaryColor, true);
        
        // 2. Persist to API (Background)
        settingsApi.update(form).catch(console.error);

        // 3. Update global state
        updateSettings(form);
        return true;
    };

    return {
        settings,
        setSettings: (newSettings: any) => {
             // Handle both functional and direct updates for compatibility
             if (typeof newSettings === 'function') {
                 const updated = newSettings(settings);
                 updateSettings(updated);
             } else {
                 updateSettings(newSettings);
             }
        },
        loading: false,
        saving: false,
        saveSettings,
        refresh: () => {}, // No-op as it's now managed globally
        applyThemeColor,
        applyThemePreset,
    };
}
