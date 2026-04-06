'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { BRAND } from '@/lib/config';
import { apiClient } from '@/lib/api-client';
import { ToastProvider, ToastContainer, PageLoadingProvider } from '@/modules/_core';

interface DashboardLayoutProps {
    children: ReactNode;
}

/**
 * DashboardLayoutInner - PURE CONTEXT PROVIDER (NO UI)
 * We stripped the UI to let individual views use InternalLayout (Luxury Minimalist).
 * This prevents the "Double Header" and "Sidebar Gap" bugs.
 */
function DashboardLayoutInner({ children }: DashboardLayoutProps) {
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedColor = localStorage.getItem('theme_color');
            const storedPreset = localStorage.getItem('theme_preset');
            return {
                primaryColor: (storedColor && storedColor !== 'null' ? storedColor : null) || BRAND.PRIMARY_COLOR,
                themePreset: (storedPreset && storedPreset !== 'null' ? storedPreset : null) || 'default',
                siteName: BRAND.NAME,
                faviconUrl: ''
            };
        }
        return {
            primaryColor: BRAND.PRIMARY_COLOR,
            themePreset: 'default',
            siteName: BRAND.NAME,
            faviconUrl: ''
        };
    });

    useEffect(() => {
        apiClient.get<any>('/settings')
            .then(res => {
                if (res.success && res.data) {
                    const data = res.data;
                    const { primaryColor, themePreset } = data;
                    const html = document.documentElement;

                    // Sync state
                    setSettings(data);
                    
                    // 1. Only re-apply Preset if different
                    const currentStoredPreset = localStorage.getItem('theme_preset');
                    if (themePreset && themePreset !== currentStoredPreset) {
                        const themeClasses = Array.from(html.classList).filter(c => c.startsWith('theme-'));
                        themeClasses.forEach(c => html.classList.remove(c));
                        if (themePreset !== 'default') {
                            html.classList.add(`theme-${themePreset}`);
                        }
                        localStorage.setItem('theme_preset', themePreset);
                        document.cookie = `theme_preset=${themePreset};path=/;max-age=31536000;SameSite=Lax`;
                    }

                    // 2. Only re-apply Color if different
                    const currentStoredColor = localStorage.getItem('theme_color');
                    if (primaryColor && primaryColor !== currentStoredColor) {
                        html.style.setProperty('--primary', primaryColor);
                        let glowValue = primaryColor;
                        if (primaryColor.startsWith('#')) {
                            glowValue = primaryColor + '26';
                        } else if (primaryColor.includes('oklch') || primaryColor.includes('rgb')) {
                            glowValue = `color-mix(in srgb, ${primaryColor}, transparent 85%)`;
                        }
                        html.style.setProperty('--primary-glow', glowValue);
                        localStorage.setItem('theme_color', primaryColor);
                        document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
                    }
                }
            })
            .catch(() => { /* ignore */ });

    }, []);


    return (
        <div className="min-h-screen w-full bg-background selection:bg-foreground selection:text-background font-instrument overflow-hidden">
            {children}
            <ToastContainer />
        </div>
    );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <ToastProvider>
            <PageLoadingProvider>
                <DashboardLayoutInner>{children}</DashboardLayoutInner>
            </PageLoadingProvider>
        </ToastProvider>
    );
}
