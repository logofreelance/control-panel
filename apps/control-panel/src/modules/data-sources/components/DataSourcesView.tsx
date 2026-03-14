/* eslint-disable react/jsx-no-literals */
'use client';

// DataSourcesView - Enhanced with Premium Mobile-First UI
// Uses composables for all data operations, component is pure UI
// ✅ PURE DI: Main component uses useConfig(), sub-components use module-level constants

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@cp/ui';
import { MODULE_LABELS, Icons } from '@cp/config/client';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { useDataSources, useDataSourceActions, useResources, useDataSourceStats } from '../composables';
import type { DataSource, Resource } from '../types';

// Module-level constants for sub-components (can't use hooks)
const L = MODULE_LABELS.dataSources;

export const DataSourcesView = () => {
    const router = useRouter();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    // Data from composables (no fetch logic here)
    const { items: sources, loading, remove, fetchAll } = useDataSources();
    const { clone } = useDataSourceActions();

    // Resource Expansion State
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const { items: resources, loading: loadingResources, remove: removeResource } = useResources(expandedId);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        id: number;
        name: string;
        type?: 'source' | 'resource';
        sourceId?: number;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Server-side Stats
    const { stats } = useDataSourceStats();

    // UI handlers (delegate to composables)
    const toggleExpand = (id: number) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
        }
    };

    const handleDelete = async () => {
        if (!confirmDialog) return;
        setSubmitting(true);

        if (confirmDialog.type === 'resource') {
            await removeResource(confirmDialog.id);
        } else {
            await remove(confirmDialog.id);
        }

        setSubmitting(false);
        setConfirmDialog(null);
    };

    const handleClone = async (id: number) => {
        const result = await clone(id);
        if (result) {
            fetchAll();
        }
    };

    // Loading state
    // if (loading) return null; // Removed blocking return

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icons.database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">{L.title}</h1>
                        <p className="text-sm text-slate-500">{L.subtitle}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => router.push('/data-sources/trash')}
                    >
                        <Icons.trash className="w-4 h-4 mr-2" /> {L.labels.viewTrash}
                    </Button>
                    <Button
                        onClick={() => router.push('/data-sources/create')}
                    >
                        <Icons.plus className="w-4 h-4 mr-2" />
                        {L.buttons.newDataSource}
                    </Button>
                </div>
            </div>

            <div className="relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Active Sources */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.labels.sources}</p>
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Icons.bookOpen className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-slate-900">{stats.total_sources}</div>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{L.labels.activeConnections}</p>
                        </div>
                    </div>

                    {/* Tables */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.labels.tables}</p>
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                <Icons.storage className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-slate-900">{stats.total_tables}</div>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{L.labels.schemasDefined}</p>
                        </div>
                    </div>

                    {/* Records */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.labels.records}</p>
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                <Icons.chart className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-slate-900">{(stats.total_records || 0).toLocaleString()}</div>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">{L.labels.totalRows}</p>
                        </div>
                    </div>

                    {/* Filler/Action Card */}
                    <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors cursor-pointer group" onClick={() => router.push('/data-sources/create')}>
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors">
                            <Icons.plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600">{L.buttons.createSource}</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="relative min-h-[300px]">
                {loading && <LoadingOverlay />}
                <div className="grid gap-4">
                    {(sources || []).length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="text-6xl mb-4 opacity-50 flex justify-center"><Icons.folderOpen className="w-16 h-16 text-slate-300" /></div>
                            <h3 className="text-lg font-semibold text-slate-700">{L.empty.title}</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto mt-2 text-sm">{L.empty.description}</p>
                            <Button onClick={() => router.push('/data-sources/create')}>{L.buttons.createSource}</Button>
                        </div>
                    ) : (
                        (sources || []).map((src) => (
                            <DataSourceCard
                                key={src.id}
                                source={src}
                                isExpanded={expandedId === src.id}
                                resources={expandedId === src.id ? resources : []}
                                loadingResources={loadingResources}
                                onToggleExpand={() => toggleExpand(src.id)}
                                onClone={() => handleClone(src.id)}
                                onDelete={() => setConfirmDialog({ id: src.id, name: src.name })}
                                onDeleteResource={(resourceId, resourceName) =>
                                    setConfirmDialog({ id: resourceId, name: resourceName, type: 'resource', sourceId: src.id })
                                }
                                router={router}
                            />
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!confirmDialog}
                onConfirm={handleDelete}
                onClose={() => setConfirmDialog(null)}
                variant="danger"
                title={confirmDialog?.type === 'resource'
                    ? `${C.actions.delete} Resource?`
                    : `${C.actions.delete} ${L.title}?`}
                message={confirmDialog?.type === 'resource'
                    ? L.messages.confirm.deleteResource
                    : L.messages.confirm.deleteSource}
                loading={submitting}
            />
        </div>
    );
};

// =============================================================================
// Sub-components (pure UI, receive all data via props)
// =============================================================================

interface DataSourceCardProps {
    source: DataSource;
    isExpanded: boolean;
    resources: Resource[];
    loadingResources: boolean;
    onToggleExpand: () => void;
    onClone: () => void;
    onDelete: () => void;
    onDeleteResource: (id: number, name: string) => void;
    router: { push: (href: string) => void };
}

const DataSourceCard = ({
    source,
    isExpanded,
    resources,
    loadingResources,
    onToggleExpand,
    onClone,
    onDelete,
    onDeleteResource,
    router,
}: DataSourceCardProps) => {
    return (
        <div
            className={`
                group bg-white rounded-xl transition-all duration-200 overflow-hidden
                ${isExpanded
                    ? 'ring-1 ring-indigo-500/20 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300'
                }
            `}
        >
            {/* Card Header / Main Row */}
            <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-5 cursor-pointer" onClick={onToggleExpand}>
                {/* Icon & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0
                        ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}
                    `}>
                        <Icons.database className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">
                                {source.name}
                            </h3>
                            {source.isSystem && (
                                <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-auto">{L.labels.system}</Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className="font-mono text-[10px] bg-slate-50 border border-slate-100 px-1.5 rounded text-slate-400">{source.tableName}</span>
                            <span className="text-slate-300">•</span>
                            <span>{source.rowCount || 0} {L.labels.records.toLowerCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={isExpanded ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100" : "text-slate-400 hover:text-slate-600"}
                    >
                        {isExpanded ? L.buttons.hideResources : L.buttons.viewResources}
                    </Button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClone(); }}
                        className="p-2 rounded-lg text-slate-300 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        title={L.buttons.cloneSource}
                    >
                        <Icons.copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title={L.buttons.deleteSource}
                    >
                        <Icons.delete className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Content (Resources) */}
            {isExpanded && (
                <ExpandedResourcesPanel
                    sourceId={source.id}
                    sourceName={source.name}
                    resources={resources}
                    loadingResources={loadingResources}
                    onDeleteResource={onDeleteResource}
                    router={router}
                />
            )}
        </div>
    );
};

import { RelationBuilder } from './RelationBuilder'; // Add import

interface ExpandedResourcesPanelProps {
    sourceId: number;
    sourceName: string;
    resources: Resource[];
    loadingResources: boolean;
    onDeleteResource: (id: number, name: string) => void;
    router: { push: (href: string) => void };
}

const ExpandedResourcesPanel = ({
    sourceId,
    sourceName,
    resources,
    loadingResources,
    onDeleteResource,
    router,
}: ExpandedResourcesPanelProps) => {
    return (
        <div className="bg-slate-50/50 border-t border-slate-200 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-300 group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Icons.table className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{L.labels.tableData}</h4>
                            <p className="text-xs text-slate-500">{L.labels.viewAndManageRecords}</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto justify-center gap-2 text-indigo-600 hover:bg-indigo-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/data-sources/${sourceId}/data`);
                        }}
                    >
                        {L.buttons.viewData} <Icons.arrowRight className="w-3 h-3" />
                    </Button>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-300 group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Icons.clipboardList className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{L.labels.schema}</h4>
                            <p className="text-xs text-slate-500">{L.labels.editColumnsTypes}</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto justify-center gap-2 text-indigo-600 hover:bg-indigo-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/data-sources/${sourceId}/schema`);
                        }}
                    >
                        {L.buttons.editSchema} <Icons.arrowRight className="w-3 h-3" />
                    </Button>
                </div>

                {/* Relations Card */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:col-span-2 lg:col-span-1 transition-all hover:border-indigo-300 group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Icons.link className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{L.messages?.relations?.title || 'Relations'}</h4>
                            <p className="text-xs text-slate-500">{L.messages?.relations?.addRelation || 'Connect tables'}</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto justify-center gap-2 text-indigo-600 hover:bg-indigo-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/data-sources/${sourceId}/relations/create`);
                        }}
                    >
                        <Icons.plus className="w-3 h-3" />
                        {L.buttons?.addRelation || "Add"}
                    </Button>
                </div>
            </div>

            {/* Relations List Section */}
            <div className="mb-8">
                <RelationBuilder
                    dataSourceId={sourceId}
                    dataSourceName={sourceName}
                />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-lg text-sm">{L.labels.apiResources}</span>
                    {loadingResources && <Icons.loading className="w-4 h-4 animate-spin text-indigo-400" />}
                </div>
                <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/data-sources/${sourceId}/resources/create`);
                    }}
                >
                    + {L.buttons.createResource}
                </Button>
            </div>

            {
                loadingResources ? (
                    <div className="h-20 bg-slate-100/50 rounded-xl animate-pulse"></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.length === 0 ? (
                            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white">
                                <p className="text-slate-400 mb-2">{L.labels.noEndpointsConfigured}</p>
                                <p className="text-xs text-slate-300">{L.labels.createResourceToExpose}</p>
                            </div>
                        ) : (
                            resources.map((r) => (
                                <ResourceCard
                                    key={r.id}
                                    resource={r}
                                    sourceId={sourceId}
                                    onDelete={() => onDeleteResource(r.id, r.name)}
                                    router={router}
                                />
                            ))
                        )}
                    </div>
                )
            }
        </div >
    );
};

interface ResourceCardProps {
    resource: Resource;
    sourceId: number;
    onDelete: () => void;
    router: { push: (href: string) => void };
}

const ResourceCard = ({ resource: r, sourceId, onDelete, router }: ResourceCardProps) => {
    const hasFilters = r.filtersJson
        ? (JSON.parse(r.filtersJson)?.filters?.length > 0 || (Array.isArray(JSON.parse(r.filtersJson)) && JSON.parse(r.filtersJson).length > 0))
        : false;
    const hasJoins = r.joinsJson ? (JSON.parse(r.joinsJson)?.length > 0) : false;

    return (
        <div
            className="group/card bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex flex-col h-full"
            onClick={(e) => {
                e.stopPropagation();
                router.push(`/data-sources/${sourceId}/resources/${r.id}/edit`);
            }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-bold">
                        GET
                    </div>
                    {hasJoins && (
                        <div className="w-6 h-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center" title={L.labels.hasJoins}><Icons.link className="w-3 h-3" /></div>
                    )}
                </div>

                {/* Actions - Always Visible */}
                <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                        className="p-1.5 hover:bg-indigo-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/data-sources/${sourceId}/resources/${r.id}/edit`);
                        }}
                    >
                        <Icons.edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                        className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Icons.delete className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-800 mb-1 group-hover/card:text-indigo-600 transition-colors truncate" title={r.name}>
                    {r.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded w-fit mb-3 border border-slate-100">
                    <span className="font-medium text-slate-500">/{r.slug}</span>
                </div>
            </div>

            {/* Feature Badges & Status */}
            <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-slate-50">
                <Badge variant={r.isPublic ? 'warning' : 'success'} className="px-1.5 py-0 h-5 text-[10px]">
                    {r.isPublic ? L.labels.public : L.labels.protected}
                </Badge>

                {hasFilters && <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center">{L.labels.filters}</span>}

                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center ${r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {r.isActive ? L.labels.active : L.labels.draft}
                </span>
            </div>
        </div>
    );
};
