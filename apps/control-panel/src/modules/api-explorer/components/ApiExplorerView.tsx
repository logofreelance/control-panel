/* eslint-disable react/jsx-no-literals */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useToast } from '@/modules/_core';
import { useApiManagement } from '@/modules/api-management/composables';
import { generateSwaggerJson } from '@/modules/api-management/utils/swaggerGenerator';

export const ApiExplorerView = () => {
    const router = useRouter();
    const { addToast } = useToast();
    const L = MODULE_LABELS.apiManagement;

    const {
        loading,
        categories,
        endpoints,
        filteredEndpoints,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory
    } = useApiManagement();

    const [activeEndpointId, setActiveEndpointId] = useState<number | null>(null);

    const handleDownloadSwagger = () => {
        const swaggerJson = generateSwaggerJson(endpoints, categories);
        const blob = new Blob([JSON.stringify(swaggerJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'swagger.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(L.messages.swaggerExported || 'Swagger exported successfully', 'success');
    };

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    // if (loading) return null; // Removed blocking return

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                        <Icons.code className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">{L.explorer?.title}</h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2 sm:line-clamp-none">{L.explorer?.subtitle}</p>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap text-xs sm:text-sm" onClick={handleDownloadSwagger}>
                        <Icons.download className="w-4 h-4 shrink-0" />
                        <span className="hidden xs:inline">{L.explorer?.downloadOpenApi}</span>
                        <span className="xs:hidden">{'OpenAPI'}</span>
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl ring-1 ring-slate-100 p-4 sticky top-4 z-20 flex flex-col sm:flex-row gap-4 items-center shadow-sm shadow-slate-200/50">
                <div className="flex-1 w-full relative">
                    <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder={L.placeholders.searchEndpoints || "Search..."}
                        className="pl-9 bg-slate-50 border-none focus:bg-white text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Endpoints List */}
            <div className="relative min-h-[400px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Navigation/Sidebar List */}
                    <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-slim pr-2">
                        {filteredEndpoints.map(ep => {
                            const methodColor =
                                ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                    ep.method === 'POST' ? 'bg-green-100 text-green-700' :
                                        ep.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700';

                            return (
                                <div
                                    key={ep.id}
                                    onClick={() => setActiveEndpointId(ep.id)}
                                    className={`p-3 rounded-xl transition-all cursor-pointer group border-transparent ring-1 ${activeEndpointId === ep.id
                                        ? 'bg-slate-50 ring-slate-200'
                                        : 'bg-white ring-slate-100 hover:ring-slate-200 hover:bg-slate-50/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${methodColor} w-12 text-center shrink-0`}>
                                            {ep.method}
                                        </span>
                                        <div className="min-w-0">
                                            <p className={`font-mono text-xs truncate ${activeEndpointId === ep.id ? 'text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>{ep.path}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{ep.description || L.messages?.noDescription}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-2">
                        {activeEndpointId ? (
                            <div className="bg-white rounded-xl ring-1 ring-slate-100 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-300 shadow-sm shadow-slate-200/50">
                                {(() => {
                                    const ep = endpoints.find(e => e.id === activeEndpointId);
                                    if (!ep) return null;

                                    const methodColor =
                                        ep.method === 'GET' ? 'bg-blue-500' :
                                            ep.method === 'POST' ? 'bg-green-500' :
                                                ep.method === 'DELETE' ? 'bg-red-500' :
                                                    'bg-amber-500';

                                    return (
                                        <>
                                            <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white ${methodColor}`}>
                                                        {ep.method}
                                                    </span>
                                                    <h2 className="text-base sm:text-lg font-mono font-semibold text-slate-800">{ep.path}</h2>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                                    {ep.description || L.messages?.noDescriptionProvided}
                                                </p>

                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Icons.lock className="w-3.5 h-3.5" />
                                                        {L.explorer?.requiredRoleLevel} <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{ep.minRoleLevel || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Icons.folder className="w-3.5 h-3.5" />
                                                        {L.explorer?.category} <span className="font-semibold text-slate-700">{categories.find(c => c.id === ep.categoryId)?.name || L.explorer?.uncategorized}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-6">
                                                {/* Response Preview */}
                                                <div>
                                                    <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-2 tracking-wider">
                                                        <Icons.code className="w-3.5 h-3.5" />
                                                        {L.explorer?.responseSchema}
                                                    </h3>
                                                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto relative group">
                                                        <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                                                            {(() => {
                                                                try {
                                                                    return JSON.stringify(JSON.parse(ep.responseData || '{}'), null, 2);
                                                                } catch {
                                                                    return ep.responseData || '{}';
                                                                }
                                                            })()}
                                                        </pre>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(ep.responseData || '{}');
                                                                addToast(L.messages?.schemaCopied || 'Copied', 'success');
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 bg-white/10 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                                        >
                                                            <Icons.copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/api-management/${ep.id}`)}
                                                    >
                                                        {L.explorer?.viewDetails}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => router.push(`/api-tester?method=${ep.method}&path=/green${ep.path}`)}
                                                        className="gap-2"
                                                    >
                                                        <Icons.flask className="w-3.5 h-3.5" />
                                                        {L.explorer?.tryItOut}
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="h-80 flex flex-col items-center justify-center text-slate-400 rounded-xl ring-1 ring-slate-100 bg-slate-50/30">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center ring-1 ring-slate-100 mb-4 text-slate-300">
                                    <Icons.rocket className="w-6 h-6" />
                                </div>
                                <p className="font-semibold text-slate-600">{L.explorer?.noEndpointSelected}</p>
                                <p className="text-xs text-slate-400 mt-1">{L.explorer?.selectEndpointHint}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

