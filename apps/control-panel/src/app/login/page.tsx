'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/lib/env';
import { fetchWithCsrf } from '@/lib/csrf';
import { Button, Input } from '@cp/ui';
import { useGlobalSettings } from '@/modules/_core';
import { Icons, LABELS as L } from '@cp/config/client';

type SystemState = 'loading' | 'no_database' | 'db_error' | 'need_install' | 'ready';

export default function LoginPage() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [status, setStatus] = useState<{ loading?: boolean; message?: string; status?: string } | null>(null);
    const [systemState, setSystemState] = useState<SystemState>('loading');
    const [systemError, setSystemError] = useState<string>('');
    const { settings } = useGlobalSettings();
    const router = useRouter();

    useEffect(() => {

        // Check if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            router.replace('/');
            return;
        }

        // Check system status
        const checkSystem = async () => {
            try {
                const res = await fetch(`${env.API_BASE}/system-status`);
                const data = await res.json();

                if (!data.hasDbUrl) {
                    setSystemState('no_database');
                    setSystemError(L.common.login.databaseUrlNotFound);
                    return;
                }

                if (!data.isDbConnected) {
                    setSystemState('db_error');
                    setSystemError(L.common.login.unableToConnect);
                    return;
                }

                if (!data.isAdminCreated) {
                    // No admin yet - redirect to install (register)
                    setSystemState('need_install');
                    setTimeout(() => router.replace('/install'), 1500);
                    return;
                }

                // All good - ready for login
                setSystemState('ready');
            } catch {
                setSystemState('db_error');
                setSystemError(L.common.system.backendServerError);
            }
        };

        checkSystem();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true });

        try {
            const res = await fetchWithCsrf(`${env.API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.status === 'success') {
                localStorage.setItem('token', data.token);
                router.push('/');
            } else {
                setStatus(data);
            }
        } catch {
            setStatus({ message: L.common.login.failedToConnect, status: 'error' });
        }
    };

    // Loading state
    if (systemState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent animate-spin rounded-full"></div>
                    <p className="text-slate-500 font-medium">{L.common.system.checkingStatus}</p>
                </div>
            </div>
        );
    }

    // No database configured
    if (systemState === 'no_database') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <Icons.error className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-600 mb-3">{L.common.login.noDatabaseFound}</h1>
                    <p className="text-slate-600 mb-6 text-sm">{systemError}</p>
                    <div className="bg-slate-900 rounded-xl p-4 text-left mb-6">
                        <p className="text-green-400 font-mono text-xs mb-2">{L.common.login.addToEnv}</p>
                        <p className="text-white font-mono text-xs break-all">{L.common.login.databaseUrlExample}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Icons.refresh className="w-4 h-4" />
                        {L.common.system.retryConnection}
                    </button>
                </div>
            </div>
        );
    }

    // Database connection error
    if (systemState === 'db_error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <Icons.warning className="w-10 h-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-amber-600 mb-3">{L.common.login.databaseError}</h1>
                    <p className="text-slate-600 mb-6 text-sm">{systemError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Icons.refresh className="w-4 h-4" />
                        {L.common.system.retryConnection}
                    </button>
                </div>
            </div>
        );
    }

    // Need to install first
    if (systemState === 'need_install') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center animate-bounce">
                        <Icons.rocket className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-purple-600 mb-3">{L.common.login.welcome}</h1>
                    <p className="text-slate-600 mb-6">{L.common.login.noAdminAccount}</p>
                    <div className="w-8 h-8 mx-auto border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // Ready - show login form
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white text-slate-900 transition-colors duration-500">

            {/* Left Column: Login Form */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative z-10">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-16">
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--primary-glow)]">
                        {settings.siteName ? settings.siteName[0].toUpperCase() : 'D'}
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
                        {settings.siteName || 'Donezo'}
                    </span>
                </div>

                <div className="max-w-md w-full mx-auto lg:mx-0">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">{L.common.login.welcomeBack}</h1>
                    <p className="text-slate-500 mb-10 font-medium">{L.common.login.enterCredentials}</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label={L.common.auth.username}
                            placeholder={L.common.login.usernameExample}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />

                        <Input
                            type="password"
                            label={L.common.auth.password}
                            placeholder={L.common.login.passwordPlaceholder}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full mt-4"
                            isLoading={status?.loading}
                        >
                            {L.common.login.signInToEngine}
                        </Button>
                    </form>

                    {status?.message && (
                        <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold text-center italic border border-red-100">
                            {status.message}
                        </div>
                    )}

                    <p className="mt-16 text-[10px] text-slate-400 text-center leading-relaxed max-w-sm mx-auto">
                        {L.common.login.authorizedOnly}
                    </p>
                </div>
            </div>

            {/* Right Column: Visual/Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--primary-glow)] rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[var(--primary-glow)]/50 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 w-full max-w-lg aspect-square">
                    <div className="w-full h-full bg-white/30 backdrop-blur-xl rounded-[4rem] shadow-2xl border border-white/50 flex items-center justify-center p-12">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Icons.database className="w-48 h-48 text-slate-400 drop-shadow-2xl" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

