'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { env } from '@/lib/env';
import { Sidebar, Header, Button, Input } from '@cp/ui';
import { Icons, getMenuItems, ToastProvider, ToastContainer, useToast, PageLoadingProvider, useGlobalSettings } from '@/modules/_core';
import { LABELS as L } from '@cp/config';
import { fetchWithCsrf } from '@/lib/csrf';

interface DashboardLayoutProps {
    children: ReactNode;
}

// Inner component that uses useToast hook
function DashboardLayoutInner({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { addToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Settings State - initialize immediately from SSR Context (No FOUC)
    const { settings, setSettings } = useGlobalSettings();

    // Profile modals
    const [activeModal, setActiveModal] = useState<'profile' | 'password' | null>(null);
    const [username, setUsername] = useState('');
    const [passForm, setPassForm] = useState({ old: '', new: '' });
    const [modalStatus, setModalStatus] = useState<{ loading?: boolean; status?: string; message?: string } | null>(null);

    // Only update title/favicon (CSS variables are already set by inline script in layout.tsx)
    useEffect(() => {
        if (settings) {
            document.title = `${settings.siteName} - ${settings.siteTitle}`;
            if (settings.faviconUrl) {
                let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = settings.faviconUrl;
            }
        }
    }, [settings]);

    useEffect(() => {
        // Quick token check (instant - localStorage is sync)
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Token exists = system is ready (user logged in before)
        // Background fetch settings to keep GlobalSettingsProvider fresh
        fetch(`${env.API_BASE}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    setSettings(data.data);
                    localStorage.setItem('site_settings', JSON.stringify(data.data));
                    document.cookie = `site_settings=${encodeURIComponent(JSON.stringify(data.data))};path=/;max-age=31536000;SameSite=Lax`;
                    const { primaryColor } = data.data;
                    document.documentElement.style.setProperty('--primary', primaryColor);
                    document.documentElement.style.setProperty('--primary-glow', primaryColor + '26');
                    document.cookie = `theme_color=${encodeURIComponent(primaryColor)};path=/;max-age=31536000;SameSite=Lax`;
                }
            })
            .catch(() => { /* ignore */ });
    }, [router, setSettings]);

    // Scroll detection for auto-hide scrollbar
    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            document.documentElement.classList.add('is-scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.documentElement.classList.remove('is-scrolling');
            }, 1000); // Hide after 1 second of no scrolling
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    // Close profile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalStatus({ loading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await fetchWithCsrf(`${env.API_BASE}/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newUsername: username })
            });
            const data = await res.json();
            setModalStatus(data);
            if (data.status === 'success') {
                setActiveModal(null);
                addToast(data.message || 'Username updated!', 'success');
            }
        } catch {
            setModalStatus({ status: 'error', message: 'Connection failed' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalStatus({ loading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await fetchWithCsrf(`${env.API_BASE}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword: passForm.old, newPassword: passForm.new })
            });
            const data = await res.json();
            setModalStatus(data);
            if (data.status === 'success') {
                setActiveModal(null);
                setPassForm({ old: '', new: '' });
                addToast(data.message || 'Password updated!', 'success');
            }
        } catch {
            setModalStatus({ status: 'error', message: 'Connection failed' });
        }
    };

    const getActiveTab = () => {
        if (pathname === '/') return 'dashboard';
        const segment = pathname.split('/')[1];
        const menuItems = getMenuItems();
        const found = menuItems.find(m => m.href === pathname || m.href === `/${segment}`);
        return found?.id || 'dashboard';
    };

    const menuItems = getMenuItems().map(item => ({
        ...item,
        href: item.href
    }));



    return (
        <div className="flex min-h-screen bg-slate-50/50 transition-colors duration-500">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeTab={getActiveTab()}
                setActiveTab={() => { }} // Navigation now handled by Link in Sidebar
                siteName={settings.siteName}
                menuItems={menuItems}
            />

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                <Header
                    onMenuToggle={() => setIsSidebarOpen(true)}
                    userInitials="AD"
                    onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                    siteName={settings.siteName}
                />

                {/* Profile Menu */}
                {showProfileMenu && (
                    <div ref={menuRef} className="absolute right-8 top-24 w-56 bg-white rounded-xl shadow-lg shadow-slate-200/50 py-1.5 z-50 transition-all duration-200 origin-top-right ring-1 ring-slate-100">
                        <div className="px-3 py-2 mb-1">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{L.common.auth.adminCentral}</p>
                        </div>
                        <div className="space-y-0.5 px-1">
                            <button onClick={() => { setActiveModal('profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left">
                                <Icons.user className="w-3.5 h-3.5" /> {L.common.auth.editUsername}
                            </button>
                            <button onClick={() => { setActiveModal('password'); setShowProfileMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left">
                                <Icons.key className="w-3.5 h-3.5" /> {L.common.auth.changePassword}
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left mt-1">
                                <Icons.signOut className="w-3.5 h-3.5" /> {L.common.auth.logout}
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div key={pathname} className="mt-4 min-w-0 overflow-x-hidden">
                    {children}
                </div>
            </main>

            {/* Toast Container */}
            <ToastContainer />

            {/* Profile Modal */}
            {activeModal === 'profile' && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl ring-1 ring-slate-900/5">
                        <h2 className="text-lg font-semibold mb-6 text-slate-800">{L.common.auth.editUsername}</h2>
                        <form onSubmit={handleUpdateUsername} className="space-y-5">
                            <Input label={L.common.fields.newUsername} value={username} onChange={(e) => setUsername(e.target.value)} required />
                            {modalStatus?.message && <p className={`text-sm ${modalStatus.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>{modalStatus.message}</p>}
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="slate" className="flex-1" onClick={() => setActiveModal(null)}>{L.common.actions.cancel}</Button>
                                <Button type="submit" className="flex-1" isLoading={modalStatus?.loading}>{L.common.actions.update}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {activeModal === 'password' && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl ring-1 ring-slate-900/5">
                        <h2 className="text-lg font-semibold mb-6 text-slate-800">{L.common.auth.changePassword}</h2>
                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <Input label={L.common.fields.currentPassword} type="password" value={passForm.old} onChange={(e) => setPassForm({ ...passForm, old: e.target.value })} required />
                            <Input label={L.common.fields.newPassword} type="password" value={passForm.new} onChange={(e) => setPassForm({ ...passForm, new: e.target.value })} required />
                            {modalStatus?.message && <p className={`text-sm ${modalStatus.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>{modalStatus.message}</p>}
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="slate" className="flex-1" onClick={() => setActiveModal(null)}>{L.common.actions.cancel}</Button>
                                <Button type="submit" className="flex-1" isLoading={modalStatus?.loading}>{L.common.actions.update}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main layout component that wraps with ToastProvider and PageLoadingProvider
export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <ToastProvider>
            <PageLoadingProvider>
                <DashboardLayoutInner>{children}</DashboardLayoutInner>
            </PageLoadingProvider>
        </ToastProvider>
    );
}
