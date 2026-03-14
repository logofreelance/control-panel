/* eslint-disable react/jsx-no-literals */
'use client';

// AuthRoutesView - Pure UI component
// All business logic is in useAuthRoutes composable
// Updated to match Dashboard design standards

import { Button } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useAuthRoutes } from '../composables';

const L = MODULE_LABELS.authRoutes;

// Method badge colors - lighter bg matching dashboard style
const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
    GET: { bg: 'bg-blue-50', text: 'text-blue-600' },
    POST: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    PUT: { bg: 'bg-amber-50', text: 'text-amber-600' },
    DELETE: { bg: 'bg-red-50', text: 'text-red-600' },
    PATCH: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export const AuthRoutesView = () => {
    const {
        loading, error,
        expandedCategory, setExpandedCategory,
        authRoutes,
        statsValues, copyToClipboard, openInTester,
        goBack, goToTester,
    } = useAuthRoutes();

    // if (loading) return null; // Removed blocking return

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="max-w-md text-center p-8 bg-white rounded-xl shadow-sm shadow-slate-200/50">
                    <Icons.error className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-base font-semibold text-slate-800 mb-2">{L.labels.loadFailed}</h3>
                    <p className="text-sm text-slate-500 mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()} size="sm" variant="outline">
                        {L.labels.tryAgain}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Icons.shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{L.title}</h1>
                        <p className="text-sm text-slate-500">{L.subtitle}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={goBack}>
                        <Icons.back className="w-4 h-4" />
                        <span className="hidden sm:inline">{L.buttons.back}</span>
                    </Button>
                    <Button size="sm" className="gap-2" onClick={goToTester}>
                        <Icons.flask className="w-4 h-4" />
                        {L.buttons.apiTester}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="relative min-h-[100px]">
                {loading && <LoadingOverlay />}
                <section className="grid grid-cols-2 gap-3 md:gap-4">
                    {/* Total Routes */}
                    <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.labels.total}</p>
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Icons.link className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">{statsValues.total}</p>
                            <p className="text-[10px] font-normal text-slate-400 mt-1">{L.labels.endpoints}</p>
                        </div>
                    </div>

                    {/* Auth Routes */}
                    <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.labels.auth}</p>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Icons.shield className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">{statsValues.auth}</p>
                            <p className="text-[10px] font-normal text-slate-400 mt-1">Protected</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Routes by Category */}
            <div className="relative min-h-[300px]">
                {loading && <LoadingOverlay />}
                <div className="space-y-4">
                    {(authRoutes || []).map(category => {
                        const isExpanded = expandedCategory === category.category;
                        const CategoryIcon = category.Icon;
                        return (
                            <div key={category.category} className="bg-white rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <CategoryIcon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-sm text-slate-900">{category.category}</h3>
                                            <p className="text-[10px] text-slate-500">{category.routes.length} {L.labels.endpoints}</p>
                                        </div>
                                    </div>
                                    <Icons.chevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Routes List */}
                                {isExpanded && (
                                    <div className="border-t border-slate-50 divide-y divide-slate-50">
                                        {category.routes.map((route, idx) => {
                                            const methodStyle = METHOD_STYLES[route.method] || METHOD_STYLES.GET;
                                            return (
                                                <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors group">
                                                    <div className="flex flex-col gap-3">
                                                        {/* Top row: Method + Path */}
                                                        <div className="flex items-start gap-3">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${methodStyle.bg} ${methodStyle.text} shrink-0`}>
                                                                {route.method}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <code className="font-mono text-xs text-slate-700 break-all tracking-tight">{route.path}</code>
                                                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{route.description}</p>

                                                                {/* Route Meta Info */}
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {route.httpStatus && (
                                                                        <div className="flex items-center gap-1 text-[9px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500">
                                                                            <Icons.info className="w-2.5 h-2.5" />
                                                                            <span>{L.labels?.status}{route.httpStatus}</span>
                                                                        </div>
                                                                    )}
                                                                    {route.headers && (
                                                                        <div className="flex items-center gap-1 text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600">
                                                                            <Icons.shield className="w-2.5 h-2.5" />
                                                                            <span>{route.headers}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {route.notes && (
                                                                    <div className="mt-2 text-[10px] bg-amber-50/50 p-2 rounded-lg text-amber-700">
                                                                        <strong className="block mb-0.5 font-medium">{L.labels?.notesLabel}</strong>
                                                                        <pre className="whitespace-pre-wrap font-sans font-normal">{route.notes}</pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex gap-1 shrink-0">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(route.path); }}
                                                                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                                >
                                                                    <Icons.copy className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); openInTester(route.method, route.path, route.body); }}
                                                                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-600 transition-colors"
                                                                >
                                                                    <Icons.flask className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Request Body */}
                                                        {route.body && (
                                                            <div className="bg-slate-900 rounded-lg p-3 overflow-auto">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-medium">{L.labels.requestBody}</span>
                                                                </div>
                                                                <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre">{route.body}</pre>
                                                            </div>
                                                        )}

                                                        {/* Response Examples */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {route.response && (
                                                                <div className="bg-emerald-50/50 rounded-lg p-3 overflow-auto">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-medium">{L.labels.successResponse}</span>
                                                                    </div>
                                                                    <pre className="text-[10px] text-emerald-700 font-mono whitespace-pre">{route.response}</pre>
                                                                </div>
                                                            )}
                                                            {route.errorResponse && (
                                                                <div className="bg-red-50/50 rounded-lg p-3 overflow-auto">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-medium">{L.labels.errorResponse}</span>
                                                                    </div>
                                                                    <pre className="text-[10px] text-red-700 font-mono whitespace-pre">{route.errorResponse}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Card */}
            <div className="p-5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -mr-16 -mt-16"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                        <Icons.tip className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{L.labels.notes}</h3>
                </div>
                <ul className="space-y-2 relative z-10">
                    <li className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-lg">
                        <Icons.users className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-normal text-slate-300" dangerouslySetInnerHTML={{ __html: L.notes.userManagement.replace('User Authentication', '<strong class="text-white">User Authentication</strong>') }}></span>
                    </li>
                    <li className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-lg">
                        <Icons.shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-normal text-slate-300">{L.notes.authHeader}</span>
                    </li>
                    <li className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-lg">
                        <Icons.flask className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-normal text-slate-300">{L.notes.clickTest}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
