'use client';

import { useEffect } from 'react';
import { BRAND } from '@/lib/config';

export function ThemeInitializer() {
    useEffect(() => {
        // Safely apply theme from independent localStorage keys
        try {
            const rawPrimary = localStorage.getItem('theme_color');
            const rawPreset = localStorage.getItem('theme_preset');
            
            const primary = (rawPrimary && rawPrimary !== 'null' ? rawPrimary : null) || BRAND.PRIMARY_COLOR;
            const preset = (rawPreset && rawPreset !== 'null' ? rawPreset : null) || 'default';

            // 1. Apply Preset Class
            const html = document.documentElement;
            const themeClasses = Array.from(html.classList).filter(c => c.startsWith('theme-'));
            themeClasses.forEach(c => html.classList.remove(c));
            
            if (preset !== 'default') {
                html.classList.add(`theme-${preset}`);
            }

            // 2. Apply Custom Primary Color
            html.style.setProperty('--primary', primary);

            // 3. Safely generate glow effect (Hex vs OKLCH)
            let glowValue = primary;
            if (primary.startsWith('#')) {
                glowValue = primary + '26';
            } else if (primary.includes('oklch') || primary.includes('rgb')) {
                glowValue = `color-mix(in srgb, ${primary}, transparent 85%)`;
            }
            html.style.setProperty('--primary-glow', glowValue);

        } catch (e) {
            console.error('[ThemeInitializer] Failed to apply cached theme', e);
        }
    }, []);


    return null;
}
