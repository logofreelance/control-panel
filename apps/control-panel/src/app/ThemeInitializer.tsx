'use client';

import { useEffect } from 'react';
import { BRAND } from '@cp/config';

export function ThemeInitializer() {
    useEffect(() => {
        // Safely read and apply theme from localStorage
        try {
            const settingsStr = localStorage.getItem('site_settings');
            if (!settingsStr) {
                // Use default if no settings
                document.documentElement.style.setProperty('--primary', BRAND.PRIMARY_COLOR);
                document.documentElement.style.setProperty('--primary-glow', BRAND.PRIMARY_COLOR + '26');
                return;
            }

            // Validate JSON and extract color
            const settings = JSON.parse(settingsStr);
            const primary = settings?.primaryColor || BRAND.PRIMARY_COLOR;

            // Validate color format (basic hex color validation)
            const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            const safeColor = colorRegex.test(primary) ? primary : BRAND.PRIMARY_COLOR;

            document.documentElement.style.setProperty('--primary', safeColor);
            document.documentElement.style.setProperty('--primary-glow', safeColor + '26');
        } catch {
            // On any error, use default
            document.documentElement.style.setProperty('--primary', BRAND.PRIMARY_COLOR);
            document.documentElement.style.setProperty('--primary-glow', BRAND.PRIMARY_COLOR + '26');
        }
    }, []);

    return null;
}
