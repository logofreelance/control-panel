'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/lib/env';
import { Button } from '@/components/ui';
import { Icons, LABELS as L } from '@/lib/config/client';

// Step configuration - using Icon components
const STEPS = [
    { id: 1, Icon: Icons.database, label: L.common.install.stepDatabase },
    { id: 2, Icon: Icons.lightning, label: L.common.install.stepSetup },
    { id: 3, Icon: Icons.user, label: L.common.install.stepAdmin },
];

// Setup checklist items
const SETUP_CHECKLIST = [
    { id: 'validate', label: L.common.install.validatingUrl },
    { id: 'provider', label: L.common.install.detectingProvider },
    { id: 'connect', label: L.common.install.connectingDatabase },
    { id: 'tables', label: L.common.install.creatingTables },
    { id: 'verify', label: L.common.install.verifyingSchema },
    { id: 'settings', label: L.common.install.initializingSettings },
];

interface ValidationResult {
    valid: boolean;
    message?: string;
    provider?: { name: string; icon: React.ReactNode };
    hints?: string[];
}

interface BackendDebugInfo {
    databaseUrlConfigured?: boolean;
    databaseUrlMasked?: string;
    corsOrigin?: string;
    nodeEnv?: string;
    connectionError?: string;
}



export default function InstallPage() {
    const router = useRouter();
    const [step, setStep] = useState(-1); // -1 = hidden/checking, 1-3 = visible steps
    const [dbUrl] = useState('');
    const [adminData, setAdminData] = useState({ username: '', password: '' });
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'loading' | 'info' } | null>(null);
    const [branding, setBranding] = useState({ siteName: 'Modular Engine', primaryColor: '#8B5CF6' });
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [, setIsValidating] = useState(false);
    const [checklistProgress, setChecklistProgress] = useState(-1);
    const [isComplete, setIsComplete] = useState(false);
    const [systemError, setSystemError] = useState<string>('');
    const [debugInfo, setDebugInfo] = useState<{
        apiUrl: string;
        targetUrl: string;
        fetchError: string | null;
        backendDebug: BackendDebugInfo | null;
    } | null>(null);

    // Fetch branding
    const fetchBranding = useCallback(() => {
        fetch(`${env.API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    setBranding(data.data);
                    localStorage.setItem('site_settings', JSON.stringify(data.data));
                }
            })
            .catch(() => { });
    }, []);

    // Check system status on mount
    useEffect(() => {
        const cached = localStorage.getItem('site_settings');
        if (cached) {
            try {
                setBranding(JSON.parse(cached));
            } catch { }
        }

        const checkSystem = async () => {
            // Always set debug info for API URL
            const targetUrl = `${env.API_URL}/system-status`;
            setDebugInfo({
                apiUrl: env.API_URL || '(not set)',
                targetUrl: targetUrl || '(empty)',
                fetchError: null,
                backendDebug: null
            });

            try {
                const res = await fetch(targetUrl);
                const data = await res.json();

                // Store backend debug info
                setDebugInfo(prev => ({
                    ...prev!,
                    backendDebug: data.debug || null
                }));

                // If admin already exists, redirect to login (block register access)
                if (data.isAdminCreated) {
                    router.replace('/login');
                    return;
                }

                // If database not configured
                if (!data.hasDbUrl) {
                    setSystemError('DATABASE_URL not configured in backend environment.');
                    setStep(1);
                    return;
                }

                // If database configured but not connected
                if (!data.isDbConnected) {
                    const connError = data.debug?.connectionError || 'Unknown error';
                    setSystemError(`Database connection failed: ${connError}`);
                    setStep(1);
                    return;
                }

                // Database connected, set validation to show success
                setValidation({
                    valid: true,
                    provider: data.provider
                });

                // If database is connected but no admin
                if (data.isInitialized && !data.isAdminCreated) {
                    setStep(3); // Skip to admin creation
                    fetchBranding();
                    return;
                }

                // Default: start from step 1
                setStep(1);
            } catch (err: unknown) {
                // Backend down - capture actual error
                const errorMessage = (err instanceof Error) ? err.message : 'Unknown network error';
                setDebugInfo(prev => ({
                    ...prev!,
                    fetchError: errorMessage
                }));

                if (!env.API_URL) {
                    setSystemError('NEXT_PUBLIC_API_URL environment variable is not set. Please configure it in your deployment settings.');
                } else {
                    setSystemError(`Cannot connect to backend at: ${env.API_URL}. Error: ${errorMessage}`);
                }
                setStep(1);
            }
        };

        checkSystem();
    }, [router, fetchBranding]);

    // Validate URL on change (debounced)
    useEffect(() => {
        if (!dbUrl || dbUrl.length < 10) {
            setValidation(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsValidating(true);

            // Client-side format validation first
            const urlRegex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
            const match = dbUrl.match(urlRegex);

            if (!match) {
                setValidation({
                    valid: false,
                    message: 'Format URL tidak valid. Gunakan: mysql://user:pass@host:port/database'
                });
                setIsValidating(false);
                return;
            }

            // Detect provider client-side
            const host = match[3];
            let providerName: string = L.common.install.mysql;
            let ProviderIcon = Icons.database;
            const hints: string[] = [];

            if (host.includes('tidbcloud.com')) {
                providerName = L.common.install.tidbCloud;
                ProviderIcon = Icons.cloud;
                if (!dbUrl.includes('multipleStatements=true')) {
                    hints.push(L.common.install.multipleStatementsHint);
                }
            } else if (host.includes('planetscale.com')) {
                providerName = L.common.install.planetscale;
                ProviderIcon = Icons.globe;
            } else if (host.includes('aiven.io')) {
                providerName = L.common.install.mysql;
                ProviderIcon = Icons.cloud;
            }

            // Try server validation, fallback to client-side if fails
            try {
                const res = await fetch(`${env.API_URL}/validate-db-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbUrl })
                });
                const data = await res.json();
                setValidation(data);
            } catch {
                // Fallback to client-side validation result
                setValidation({
                    valid: true,
                    provider: { name: providerName, icon: <ProviderIcon className="w-5 h-5" /> },
                    hints,
                    message: L.common.install.validFormat
                });
            }
            setIsValidating(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [dbUrl]);

    // Animate checklist during setup
    useEffect(() => {
        if (step === 2 && checklistProgress >= 0) {
            if (checklistProgress < SETUP_CHECKLIST.length) {
                const timer = setTimeout(() => {
                    setChecklistProgress(prev => prev + 1);
                }, 600);
                return () => clearTimeout(timer);
            }
        }
    }, [step, checklistProgress]);

    // Handle database setup
    const handleDbSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validation?.valid) return;

        setStep(2);
        setChecklistProgress(0);
        setStatus({ message: 'Initializing...', type: 'loading' });

        try {
            const res = await fetch(`${env.API_URL}/setup-db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dbUrl }),
            });
            const data = await res.json();

            if (data.status === 'success') {
                // Wait for checklist to complete
                await new Promise(resolve => setTimeout(resolve, SETUP_CHECKLIST.length * 600 + 500));
                setStatus({ message: `Connected to ${data.provider?.name || 'Database'}!`, type: 'success' });
                fetchBranding();
                setTimeout(() => {
                    setStatus(null);
                    setStep(3);
                }, 1500);
            } else {
                setStatus({ message: data.message || 'Setup failed', type: 'error' });
                setTimeout(() => setStep(1), 2000);
            }
        } catch {
            setStatus({ message: 'Backend connection failed', type: 'error' });
            setTimeout(() => setStep(1), 2000);
        }
    };

    // Handle admin creation
    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ message: 'Creating admin account...', type: 'loading' });

        try {
            const res = await fetch(`${env.API_URL}/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData),
            });
            const data = await res.json();

            if (data.status === 'success') {
                setIsComplete(true);
                setStatus({ message: 'Installation Complete!', type: 'success' });
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus({ message: data.message || 'Failed to create admin', type: 'error' });
            }
        } catch {
            setStatus({ message: 'Failed to create admin account', type: 'error' });
        }
    };

    const primaryColor = branding.primaryColor || '#8B5CF6';

    // Step -1: Hidden while checking/redirecting - show nothing
    if (step === -1) {
        return null; // Completely blank - no UI shown
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
            style={{ '--primary': primaryColor, '--primary-glow': primaryColor + '30' } as React.CSSProperties}
        >
            {/* Animated Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl p-8 sm:p-10">

                    {/* Logo Header */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
                        >
                            {branding.siteName?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            {branding.siteName || 'Modular Engine'}
                        </span>
                    </div>

                    {/* Step Indicator */}
                    {!isComplete && (
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex items-center">
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                                        ${step >= s.id
                                            ? 'bg-white text-slate-900 shadow-lg shadow-white/20'
                                            : 'bg-white/10 text-white/50 border border-white/20'}
                                        ${step === s.id ? 'scale-110 ring-4 ring-white/20' : ''}
                                    `}>
                                        <s.Icon className="w-5 h-5" />
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`w-8 h-1 mx-1 rounded-full transition-all duration-500 ${step > s.id ? 'bg-white' : 'bg-white/20'
                                            }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step Labels */}
                    {!isComplete && (
                        <div className="flex justify-center gap-6 mb-8">
                            {STEPS.map((s) => (
                                <span key={s.id} className={`text-xs font-bold uppercase tracking-wider transition-colors ${step === s.id ? 'text-white' : 'text-white/40'
                                    }`}>
                                    {s.label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Step 1: Environment Configuration Check */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">{L.common.install.configCheck}</h1>
                                <p className="text-white/60 text-sm">{L.common.install.checkingEnvAndDb}</p>
                            </div>

                            {/* System Error Banner */}
                            {systemError && (
                                <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
                                    <div className="flex items-center gap-2 text-red-300 text-sm font-medium mb-2">
                                        <Icons.warning className="w-4 h-4" />
                                        <span>{L.common.install.connectionError}</span>
                                    </div>
                                    <p className="text-red-200 text-xs">{systemError}</p>
                                </div>
                            )}

                            {/* Environment Debug Info */}
                            <div className="space-y-3 mb-6">
                                {/* NEXT_PUBLIC_API_URL Status */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white/60 text-xs font-bold uppercase">{L.common.install.nextPublicApiUrl}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${debugInfo?.apiUrl && debugInfo.apiUrl !== '(not set)' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {debugInfo?.apiUrl && debugInfo.apiUrl !== '(not set)' ? L.common.install.set : L.common.install.notSet}
                                        </span>
                                    </div>
                                    <code className="text-xs font-mono text-white/80 break-all block">
                                        {debugInfo?.apiUrl || 'Loading...'}
                                    </code>
                                    {(!debugInfo?.apiUrl || debugInfo.apiUrl === '(not set)') && (
                                        <p className="text-amber-300 text-[10px] mt-2">
                                            {L.common.install.setEnvHint}
                                        </p>
                                    )}
                                </div>

                                {/* Target URL Being Called */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white/60 text-xs font-bold uppercase">{L.common.install.targetUrl}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300">
                                            {L.common.install.systemStatusEndpoint}
                                        </span>
                                    </div>
                                    <code className="text-xs font-mono text-white/60 break-all block">
                                        {debugInfo?.targetUrl || 'Loading...'}
                                    </code>
                                </div>

                                {/* Fetch Error (if any) */}
                                {debugInfo?.fetchError && (
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-red-400 text-xs font-bold uppercase">{L.common.install.networkError}</span>
                                        </div>
                                        <code className="text-xs font-mono text-red-300 break-all block">
                                            {debugInfo.fetchError}
                                        </code>
                                        <p className="text-red-200 text-[10px] mt-2">
                                            {L.common.install.networkErrorHint}
                                        </p>
                                    </div>
                                )}

                                {/* Backend Debug Info (if connected) */}
                                {debugInfo?.backendDebug && (
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-blue-400 text-xs font-bold uppercase">{L.common.install.backendStatus}</span>
                                        </div>
                                        <div className="space-y-1 text-xs font-mono text-blue-200">
                                            <p>{L.common.install.databaseUrl}{':'} <span className={debugInfo.backendDebug.databaseUrlConfigured ? 'text-emerald-300' : 'text-red-300'}>
                                                {debugInfo.backendDebug.databaseUrlConfigured ? L.common.install.configured : L.common.install.notSet}
                                            </span></p>
                                            {debugInfo.backendDebug.databaseUrlMasked && (
                                                <p className="text-white/50 break-all">{debugInfo.backendDebug.databaseUrlMasked}</p>
                                            )}
                                            <p>{L.common.install.cors}{':'} <span className="text-white/70">{debugInfo.backendDebug.corsOrigin}</span></p>
                                            <p>{L.common.install.nodeEnv}{':'} <span className="text-white/70">{debugInfo.backendDebug.nodeEnv}</span></p>
                                            {debugInfo.backendDebug.connectionError && (
                                                <p className="text-red-300 mt-2">{L.common.install.dbError}{':'} {debugInfo.backendDebug.connectionError}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Connection Status Summary */}
                                {validation && (
                                    <div className={`p-4 rounded-2xl border ${validation.valid
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-red-500/10 border-red-500/30'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg ${validation.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {validation.valid ? <Icons.check className="w-5 h-5" /> : <Icons.close className="w-5 h-5" />}
                                            </span>
                                            <span className={`text-sm font-medium ${validation.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                                                {validation.valid ? L.common.install.connectedToDatabase : validation.message || L.common.install.connectionFailed}
                                            </span>
                                        </div>
                                        {validation.valid && validation.provider && (
                                            <div className="flex items-center gap-2 text-white/80 text-xs mt-2">
                                                <span>{validation.provider.icon}</span>
                                                <span>{validation.provider.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {validation?.valid ? (
                                    <Button
                                        onClick={handleDbSetup}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {L.common.install.initializeDbTables}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="w-full"
                                        size="lg"
                                        variant="outline"
                                    >
                                        <Icons.refresh className="w-4 h-4 inline mr-2" />
                                        {L.common.install.retryConnection}
                                    </Button>
                                )}

                                <p className="text-white/40 text-[10px] text-center">
                                    {L.common.install.envConfigNote}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Setup/Loading */}
                    {step === 2 && (
                        <div className="animate-in fade-in duration-500 py-4">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">{L.common.install.settingUpEngine}</h1>
                                <p className="text-white/60 text-sm">{L.common.install.pleaseWait}</p>
                            </div>

                            {/* Animated Spinner */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center"><Icons.lightning className="w-8 h-8 text-white" /></div>
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="space-y-2">
                                {SETUP_CHECKLIST.map((item, i) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${checklistProgress > i
                                            ? 'bg-white/10'
                                            : checklistProgress === i
                                                ? 'bg-white/5'
                                                : 'opacity-40'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${checklistProgress > i
                                            ? 'bg-emerald-500 text-white'
                                            : checklistProgress === i
                                                ? 'bg-white/20 text-white animate-pulse'
                                                : 'bg-white/10 text-white/40'
                                            }`}>
                                            {checklistProgress > i ? <Icons.check className="w-4 h-4 text-white" /> : checklistProgress === i ? <Icons.loading className="w-4 h-4 animate-spin" /> : <Icons.circle className="w-4 h-4" />}
                                        </div>
                                        <span className={`text-sm font-medium ${checklistProgress >= i ? 'text-white' : 'text-white/40'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                                        style={{ width: `${Math.min((checklistProgress / SETUP_CHECKLIST.length) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-white/40 text-xs text-center mt-2">
                                    {Math.round((checklistProgress / SETUP_CHECKLIST.length) * 100)} {L.common.install.percentComplete}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Admin Account */}
                    {step === 3 && !isComplete && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">{L.common.install.createAdminBtn}</h1>
                                <p className="text-white/60 text-sm">{L.common.install.setUpCredentials}</p>
                            </div>

                            {/* Database Connected Badge */}
                            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                <Icons.check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-300 text-sm font-medium">{L.common.install.databaseConnected}</span>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="space-y-5">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2"><Icons.user className="w-5 h-5 text-white/50" /></div>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={adminData.username}
                                        onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2"><Icons.key className="w-5 h-5 text-white/50" /></div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={adminData.password}
                                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                {/* Password Strength */}
                                {adminData.password && (
                                    <div className="space-y-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full transition-all ${adminData.password.length >= level * 3
                                                        ? level <= 2
                                                            ? 'bg-amber-500'
                                                            : 'bg-emerald-500'
                                                        : 'bg-white/10'
                                                        }`}
                                                ></div>
                                            ))}
                                        </div>
                                        <p className={`text-xs ${adminData.password.length >= 9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {adminData.password.length >= 12 ? 'Strong password' :
                                                adminData.password.length >= 9 ? 'Good password' :
                                                    adminData.password.length >= 6 ? 'Weak password' : 'Too short'}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={status?.type === 'loading'}
                                    disabled={!adminData.username || adminData.password.length < 6}
                                >
                                    {L.common.install.completeSetup}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Completion Screen */}
                    {isComplete && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 py-8 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center text-5xl shadow-lg shadow-emerald-500/30 animate-bounce">
                                <Icons.check className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-3">{L.common.install.allSet}</h1>
                            <p className="text-white/60 mb-8">{L.common.install.engineReadyToUse}</p>

                            <div className="space-y-3 text-left bg-white/5 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <Icons.check className="w-4 h-4 text-emerald-400" /> {L.common.install.databaseConnected}
                                </div>
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <Icons.check className="w-4 h-4 text-emerald-400" /> {L.common.install.tablesCreated}
                                </div>
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <Icons.check className="w-4 h-4 text-emerald-400" /> {L.common.install.adminAccountReady}
                                </div>
                            </div>

                            <p className="text-white/40 text-sm animate-pulse">
                                {L.common.install.redirectingToLogin}
                            </p>
                        </div>
                    )}

                    {/* Status Message */}
                    {status && step !== 2 && !isComplete && (
                        <div className={`mt-6 p-4 rounded-2xl text-center text-sm font-medium ${status.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : status.type === 'error'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-white/10 text-white/80 border border-white/20'
                            }`}>
                            {status.message}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-white/30 text-xs mt-6">
                    {L.common.install.poweredBy}
                </p>
            </div >
        </div >
    );
}

