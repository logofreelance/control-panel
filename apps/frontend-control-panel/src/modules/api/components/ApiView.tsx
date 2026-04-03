'use client';

// ApiView - API keys and CORS management
// Manages API access keys and cross-origin domains

import { Button, Input, Badge, Skeleton } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { ConfirmDialog } from '@/modules/_core';
import { env } from '@/lib/env';
import { useApi } from '../composables';
import { IntegrationGuide } from './IntegrationGuide';

const L = MODULE_LABELS.api;

export const ApiView = () => {
    const {
        keys,
        domains,
        newKeyName,
        newDomain,
        loading,
        submitting,
        confirmDialog,
        setNewKeyName,
        setNewDomain,
        handleCreateKey,
        handleAddDomain,
        handleDelete,
        copyToClipboard,
        openDeleteDialog,
        closeDeleteDialog,
        getConfirmDialogTitle,
        getConfirmDialogMessage,
    } = useApi();

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-6 animate-page-enter">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-1">{L.title}</h1>
                    <p className="text-sm text-slate-500 font-medium">{L.subtitle}</p>
                </div>
                <Badge variant="secondary" className="w-fit gap-1">
                    <Icons.lock className="w-3 h-3" /> {L.labels.protected}
                </Badge>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-medium text-slate-500">{L.stats.apiKeys}</p>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Icons.key className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-slate-800">{keys.length}</p>
                        <p className="text-[10px] font-normal text-slate-400 mt-1">{L.stats.registered}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-medium text-slate-500">{L.stats.activeKeys}</p>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Icons.checkCircle className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-slate-800">{keys.filter((k) => k.isActive !== false).length}</p>
                        <p className="text-[10px] font-normal text-slate-400 mt-1">{L.stats.valid}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-medium text-slate-500">{L.stats.corsDomains}</p>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Icons.globe className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-slate-800">{domains.length}</p>
                        <p className="text-[10px] font-normal text-slate-400 mt-1">{L.stats.allowed}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-medium text-slate-500">{L.stats.baseUrl}</p>
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                            <Icons.rocket className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-mono font-medium text-[var(--primary)] truncate" title={env.API_URL}>{env.API_URL}</p>
                        <p className="text-[10px] font-normal text-slate-400 mt-1">{L.stats.apiEndpoint}</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col relative min-h-[300px]">
                    {loading && <LoadingOverlay />}
                    <div className="p-4 sm:p-5 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                                <Icons.key className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-slate-800">{L.sections.apiAccessKeys}</h3>
                                <p className="text-[10px] text-slate-500">{L.labels.keys}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600">{keys.length} keys</Badge>
                    </div>
                    <div className="p-4 sm:p-5 bg-slate-50/30 flex-1">
                        <form onSubmit={handleCreateKey} className="flex gap-2 mb-4">
                            <Input className="flex-1 min-w-0" placeholder={L.placeholders.keyName} value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} required />
                            <Button type="submit" isLoading={submitting} disabled={submitting} size="sm">{L.buttons.create}</Button>
                        </form>
                        <div className="space-y-2">
                            {keys.map((k) => (
                                <div key={k.id} className="group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                                            key
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-700 text-sm truncate">{k.name}</p>
                                            <code className="text-[10px] font-mono text-slate-500 truncate w-24 sm:w-32 block">{k.key}</code>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(k.key); }} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                            <Icons.copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button type="button" onClick={() => openDeleteDialog('api-keys', k.id, k.name)} className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors">
                                            <Icons.trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col relative min-h-[300px]">
                    {loading && <LoadingOverlay />}
                    <div className="p-4 sm:p-5 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                                <Icons.globe className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-slate-800">{L.sections.corsDomainsTitle}</h3>
                                <p className="text-[10px] text-slate-500">{L.labels.domains}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600">{domains.length} domains</Badge>
                    </div>
                    <div className="p-4 sm:p-5 bg-slate-50/30 flex-1">
                        <form onSubmit={handleAddDomain} className="flex gap-2 mb-4">
                            <Input className="flex-1 min-w-0" placeholder={L.placeholders.domain} value={newDomain} onChange={(e) => setNewDomain(e.target.value)} required />
                            <Button type="submit" isLoading={submitting} disabled={submitting} size="sm">{L.buttons.add}</Button>
                        </form>
                        <div className="space-y-2">
                            {domains.map((d) => (
                                <div key={d.id} className="group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Icons.globe className="w-3.5 h-3.5" />
                                        </div>
                                        <code className="text-sm font-medium text-slate-700 truncate">{d.domain}</code>
                                    </div>
                                    <button type="button" onClick={() => openDeleteDialog('cors', d.id, d.domain)} className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                                        <Icons.trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <IntegrationGuide copyToClipboard={copyToClipboard} />

            <ConfirmDialog
                isOpen={!!confirmDialog}
                onClose={closeDeleteDialog}
                onConfirm={handleDelete}
                title={getConfirmDialogTitle()}
                message={getConfirmDialogMessage()}
                confirmText={L.confirm.deleteApiKey.split(' ')[0]}
                variant="danger"
                loading={submitting}
            />
        </div>
    );
};

