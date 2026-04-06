'use client';

import { useEffect } from 'react';
import { BRAND } from '@/lib/config';
import { apiClient } from '@/lib/api-client';

export function ThemeInitializer() {
    useEffect(() => {
        const applyTheme = (color: string, preset: string) => {
            const html = document.documentElement;
            
            // 1. Class Clean and Apply
            const themeClasses = Array.from(html.classList).filter(c => c.startsWith('theme-'));
            themeClasses.forEach(c => html.classList.remove(c));
            if (preset && preset !== 'default') {
                html.classList.add(`theme-${preset}`);
            }

            // 2. Variables
            html.style.setProperty('--primary', color);
            let glowValue = color;
            if (color.startsWith('#')) {
                glowValue = color + '26';
            } else if (color.includes('oklch') || color.includes('rgb')) {
                glowValue = `color-mix(in srgb, ${color}, transparent 85%)`;
            }
            html.style.setProperty('--primary-glow', glowValue);

            // 3. Storage Sync
            localStorage.setItem('theme_color', color);
            localStorage.setItem('theme_preset', preset || 'default');
            document.cookie = `theme_color=${encodeURIComponent(color)};path=/;max-age=31536000;SameSite=Lax`;
            document.cookie = `theme_preset=${preset || 'default'};path=/;max-age=31536000;SameSite=Lax`;
        };

        // Execution logic
        try {
            // Apply immediate from cache first for zero-flicker if data exists
            const rawPrimary = localStorage.getItem('theme_color');
            const rawPreset = localStorage.getItem('theme_preset');
            
            if (rawPrimary && rawPrimary !== 'null' && rawPreset && rawPreset !== 'null') {
                applyTheme(rawPrimary, rawPreset);
            }

            // ALWAYS fetch from API on Mount (Hard Reload) to ensure it matches the database
            // This ensures "Branding Consistency" without needing to visit /settings
            apiClient.get<any>('/settings').then(res => {
                if (res.success && res.data) {
                    const { primaryColor, themePreset } = res.data;
                    applyTheme(primaryColor || BRAND.PRIMARY_COLOR, themePreset || 'default');
                }
            }).catch(() => {
                // If API fails (e.g. offline), the cached version remains applied
                console.warn('[ThemeInitializer] API sync failed, using cached values.');
            });
        } catch (e) {
            console.error('[ThemeInitializer] Initialization runtime error:', e);
        }
    }, []);




    return null;
}
