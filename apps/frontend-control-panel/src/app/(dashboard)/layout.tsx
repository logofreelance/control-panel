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
    const [settings, setSettings] = useState<{ primaryColor: string; siteName: string; faviconUrl: string; siteTitle?: string }>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('site_settings');
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch { /* ignore */ }
            }
        }
        return {
            primaryColor: BRAND.PRIMARY_COLOR,
            siteName: BRAND.NAME,
            faviconUrl: ''
        };
    });

    useEffect(() => {
        apiClient.get<any>('/settings')
            .then(data => {
                if (data.success && data.data) {
                    setSettings(data.data);
                    const { primaryColor } = data.data;
                    document.documentElement.style.setProperty('--primary', primaryColor);
                    document.documentElement.style.setProperty('--primary-glow', primaryColor + '26');
                    localStorage.setItem('site_settings', JSON.stringify(data.data));
                    document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
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
