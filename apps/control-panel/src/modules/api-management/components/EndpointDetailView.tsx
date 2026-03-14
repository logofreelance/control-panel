'use client';

import { useState } from 'react';
import { Button } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useEndpointDetail } from '../composables/useEndpointDetail';

// Constants to avoid hardcoded literals
const JSON_CONTENT_TYPE = 'application/json';

interface EndpointDetailViewProps {
    endpointId: number;
}

export const EndpointDetailView = ({ endpointId }: EndpointDetailViewProps) => {
    const L = MODULE_LABELS.apiManagement;
    const { loading, endpoint, dataSource, resource, getFullUrl, getCodeExamples, router } = useEndpointDetail(endpointId);

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'javascript' | 'python'>('curl');

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (loading) return null;

    if (!endpoint) {
        return (
            <div className="text-center py-20">
                <Icons.warning className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{L.misc?.noEndpointsOne}</p>
            </div>
        );
    }

    const fullUrl = getFullUrl();
    const codeExamples = getCodeExamples();
    const methodColors: Record<string, string> = {
        GET: 'bg-blue-500',
        POST: 'bg-green-500',
        PUT: 'bg-amber-500',
        PATCH: 'bg-purple-500',
        DELETE: 'bg-red-500'
    };

    const getRoleLevelLabel = (level: number) => {
        if (level === 0) return L.options?.public || 'Public';
        if (level < 50) return L.options?.login || 'Login Required';
        if (level < 90) return L.options?.moderator || 'Moderator';
        return L.options?.admin || 'Admin Only';
    };

    // Parse JSON fields safely
    const parseJsonArray = (str?: string): string[] => {
        if (!str) return [];
        try { return JSON.parse(str); } catch { return []; }
    };

    const parseJsonObject = (str?: string): Record<string, string> => {
        if (!str) return {};
        try { return JSON.parse(str); } catch { return {}; }
    };

    const writableFields = parseJsonArray(endpoint.writableFields);
    const protectedFields = parseJsonArray(endpoint.protectedFields);
    const autoPopulateFields = parseJsonObject(endpoint.autoPopulateFields);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white tracking-wide shadow-sm ${methodColors[endpoint.method]}`}>
                            {endpoint.method}
                        </span>
                        <code className="text-lg font-mono text-slate-800 tracking-tight font-semibold">{endpoint.path}</code>
                        {endpoint.isActive ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] uppercase font-bold tracking-wide">{L.labels?.active}</span>
                        ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] uppercase font-bold tracking-wide">{L.labels?.inactive}</span>
                        )}
                    </div>
                    {endpoint.description && (
                        <p className="text-sm text-slate-500 max-w-2xl">{endpoint.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-xs">
                        <Icons.arrowLeft className="w-3.5 h-3.5 mr-1" /> {L.buttons?.back}
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/api-management/${endpointId}/edit`)} className="text-xs">
                        <Icons.edit className="w-3.5 h-3.5 mr-1" /> {L.buttons?.edit}
                    </Button>
                </div>
            </div>

            {/* Quick Copy URL */}
            <div className="bg-white p-4 rounded-xl shadow-sm shadow-slate-200/50">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{L.detail?.fullUrl}</p>
                        <code className="text-xs sm:text-sm font-mono text-slate-700 break-all">{fullUrl}</code>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(fullUrl, 'url')}
                        className="shrink-0 h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                        {copiedField === 'url' ? <Icons.check className="w-4 h-4 text-emerald-500" /> : <Icons.copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Request Info */}
                    <div className="bg-white p-5 rounded-xl shadow-sm shadow-slate-200/50">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                            <Icons.send className="w-4 h-4 text-blue-500" />
                            {L.detail?.requestInfo}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-xs text-slate-500 font-medium">{L.detail?.method}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${methodColors[endpoint.method]}`}>
                                    {endpoint.method}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-xs text-slate-500 font-medium">{L.detail?.contentType}</span>
                                <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">{JSON_CONTENT_TYPE}</span>
                            </div>
                            {dataSource && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-xs text-slate-500 font-medium">{L.labels?.dataSource}</span>
                                    <span className="text-sm font-medium text-slate-900 tracking-tight">{dataSource.name}</span>
                                </div>
                            )}
                            {resource && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-xs text-slate-500 font-medium">{L.labels?.resource}</span>
                                    <span className="text-sm font-medium text-slate-900 tracking-tight">{resource.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white p-5 rounded-xl shadow-sm shadow-slate-200/50">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                            <Icons.lock className="w-4 h-4 text-amber-500" />
                            {L.detail?.security}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-xs text-slate-500 font-medium">{L.misc?.accessLevel}</span>
                                <span className="text-sm font-medium text-slate-900 tracking-tight border-b border-dotted border-slate-300">
                                    {getRoleLevelLabel(endpoint.minRoleLevel ?? 0)}
                                </span>
                            </div>
                            {endpoint.roles && (
                                <div className="text-sm">
                                    <span className="text-xs text-slate-500 font-medium block mb-2">{L.labels?.roles}</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {endpoint.roles.split(',').map(role => (
                                            <span key={role} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-medium tracking-tight">{role.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {endpoint.permissions && (
                                <div className="text-sm">
                                    <span className="text-xs text-slate-500 font-medium block mb-2">{L.labels?.permissions}</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {endpoint.permissions.split(',').map(perm => (
                                            <span key={perm} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-[10px] font-medium tracking-tight">{perm.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Responses */}
                    <div className="bg-white p-5 rounded-xl shadow-sm shadow-slate-200/50">
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                            <Icons.warning className="w-4 h-4 text-red-500" />
                            {L.detail?.errorResponses}
                        </h3>
                        <p className="text-[10px] text-slate-400 mb-4">{L.detail?.errorResponsesHint}</p>
                        <div className="space-y-2">
                            {[
                                { code: 401, suffix: 'UNAUTHORIZED', color: 'amber', msg: 'Authentication required' },
                                { code: 403, suffix: 'FORBIDDEN', color: 'orange', msg: 'Access denied' },
                                { code: 404, suffix: 'NOT_FOUND', color: 'slate', msg: 'Resource not found' },
                                { code: 500, suffix: 'SERVER_ERROR', color: 'red', msg: 'Server error' },
                            ].map(err => {
                                const pathSlug = endpoint.path
                                    .replace(/^\//, '')
                                    .replace(/:[^/]+/g, '')
                                    .replace(/\//g, '_')
                                    .replace(/_+/g, '_')
                                    .replace(/_+$/, '')
                                    .toUpperCase() || 'ENDPOINT';
                                const errorCode = `${pathSlug}_${err.suffix}`;
                                return (
                                    <div key={err.code} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded bg-${err.color}-100 text-${err.color}-700 min-w-[32px] text-center`}>
                                                {err.code}
                                            </span>
                                            <code className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5">
                                                {errorCode}
                                            </code>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{err.msg}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mutation Config - Only for write operations */}
                    {['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && (
                        <div className="bg-white p-5 rounded-xl shadow-sm shadow-slate-200/50">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                                <Icons.edit className="w-4 h-4 text-purple-500" />
                                {L.mutation?.title}
                            </h3>
                            <div className="space-y-4">
                                {writableFields.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-2">{L.mutation?.writableFields}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {writableFields.map(f => (
                                                <span key={f} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-mono">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {protectedFields.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-2">{L.mutation?.protectedFields}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {protectedFields.map(f => (
                                                <span key={f} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-md text-[10px] font-mono">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Object.keys(autoPopulateFields).length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-2">{L.mutation?.autoPopulate}</p>
                                        <div className="space-y-1.5">
                                            {Object.entries(autoPopulateFields).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-2 text-[10px]">
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded font-mono">{key}</span>
                                                    <Icons.arrowRight className="w-3 h-3 text-slate-300" />
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {endpoint.ownershipColumn && (
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-50">
                                        <span className="text-xs text-slate-500 font-medium">{L.mutation?.ownershipColumn}</span>
                                        <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded">{endpoint.ownershipColumn}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Code Examples */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm shadow-slate-200/50">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                            <Icons.code className="w-4 h-4 text-emerald-500" />
                            {L.detail?.codeExamples}
                        </h3>

                        {/* Tab Buttons */}
                        <div className="flex gap-1 mb-4 bg-slate-50 p-1 rounded-lg">
                            {(['curl', 'javascript', 'python'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveCodeTab(tab)}
                                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeCodeTab === tab
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {tab === 'curl' ? 'cURL' : tab === 'javascript' ? 'JavaScript' : 'Python'}
                                </button>
                            ))}
                        </div>

                        {/* Code Block */}
                        <div className="relative group">
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10px] sm:text-xs overflow-x-auto font-mono leading-relaxed border border-slate-800">
                                {codeExamples[activeCodeTab]}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(codeExamples[activeCodeTab], activeCodeTab)}
                                className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                {copiedField === activeCodeTab ? (
                                    <Icons.check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <Icons.copy className="w-3.5 h-3.5 text-slate-300" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Response Template */}
                    {endpoint.responseData && (
                        <div className="bg-white p-5 rounded-xl shadow-sm shadow-slate-200/50">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                                <Icons.file className="w-4 h-4 text-indigo-500" />
                                {L.detail?.responseTemplate}
                            </h3>
                            <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[10px] sm:text-xs overflow-x-auto font-mono text-slate-600 leading-relaxed">
                                {endpoint.responseData}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

