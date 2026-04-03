'use client';

// databaseSchemaView - Enhanced with Premium Mobile-First UI
// Uses composables for all data operations, component is pure UI
// ✅ PURE DI: Main component uses useConfig(), sub-components use module-level constants

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Heading, Text, Stack, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Icons } from '../config/icons';
import { DATABASE_SCHEMA_LABELS } from '../constants/ui-labels';
import { ConfirmDialog, useConfig, PageLoadingSkeleton } from '@/modules/_core';
import { useDatabaseSchema, useSchemaActions, useResources, useSchemaStats } from '../composables';
import type { DatabaseTable, Resource } from '../types';

// Module-level constants for sub-components (can't use hooks)
const L = DATABASE_SCHEMA_LABELS;

export const DatabaseSchemaView = () => {
    const router = useRouter();
    const { id: targetId } = useParams();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    // Data from composables (no fetch logic here)
    const { items: sources, loading, remove, fetchAll } = useDatabaseSchema();
    const { clone } = useSchemaActions();

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
    const { stats } = useSchemaStats();

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
        <div className="absolute inset-0 bg-background z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Stack direction="row" align="center" gap={3}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icons.database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <Heading level={2}>{L.title}</Heading>
                        <Text variant="muted">{L.subtitle}</Text>
                    </div>
                </Stack>
                <Stack direction="row" gap={3}>
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        onClick={() => router.push(targetId ? `/target/${targetId}/database-schema/trash` : '/database-schema/trash')}
                    >
                        <Icons.trash className="w-4 h-4 mr-2" /> {L.labels.viewTrash}
                    </Button>
                    <Button
                        onClick={() => router.push(targetId ? `/target/${targetId}/database-schema/create` : '/database-schema/create')}
                    >
                        <Icons.plus className="w-4 h-4 mr-2" />
                        {L.buttons.createSchema}
                    </Button>
                </Stack>
            </div>

            <div className="relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Active Sources */}
                    <Card  className="p-4 sm:p-5">
                        <Stack direction="row" justify="between" align="start" className="mb-3">
                            <Text variant="detail">{L.labels.sources}</Text>
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icons.bookOpen className="w-3.5 h-3.5" />
                            </div>
                        </Stack>
                        <div>
                            <div className="text-xl font-semibold text-foreground">{stats.total_sources}</div>
                            <Text variant="muted" className="text-[10px] mt-1">{L.labels.activeConnections}</Text>
                        </div>
                    </Card>

                    {/* Tables */}
                    <Card  className="p-4 sm:p-5">
                        <Stack direction="row" justify="between" align="start" className="mb-3">
                            <Text variant="detail">{L.labels.tables}</Text>
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icons.storage className="w-3.5 h-3.5" />
                            </div>
                        </Stack>
                        <div>
                            <div className="text-xl font-semibold text-foreground">{stats.total_tables}</div>
                            <Text variant="muted" className="text-[10px] mt-1">{L.labels.schemasDefined}</Text>
                        </div>
                    </Card>

                    {/* Records */}
                    <Card  className="p-4 sm:p-5">
                        <Stack direction="row" justify="between" align="start" className="mb-3">
                            <Text variant="detail">{L.labels.records}</Text>
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icons.chart className="w-3.5 h-3.5" />
                            </div>
                        </Stack>
                        <div>
                            <div className="text-xl font-semibold text-foreground">{(stats.total_records || 0).toLocaleString()}</div>
                            <Text variant="muted" className="text-[10px] mt-1">{L.labels.totalRows}</Text>
                        </div>
                    </Card>

                    {/* Filler/Action Card */}
                    <div className="bg-muted rounded-xl p-4 sm:p-5 border border-dashed border-border flex flex-col items-center justify-center text-center hover:bg-muted transition-colors cursor-pointer group" onClick={() => router.push(targetId ? `/target/${targetId}/database-schema/create` : '/database-schema/create')}>
                        <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center mb-2 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                            <Icons.plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">{L.buttons.createSchema}</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="relative min-h-[300px]">
                {loading && <LoadingOverlay />}
                <div className="grid gap-4">
                    {(sources || []).length === 0 ? (
                        <div className="text-center py-20 bg-muted rounded-xl border border-dashed border-border">
                            <div className="text-6xl mb-4 opacity-50 flex justify-center"><Icons.folderOpen className="w-16 h-16 text-muted-foreground" /></div>
                            <Heading level={5}>{L.empty.title}</Heading>
                            <Text variant="muted" className="mb-6 max-w-md mx-auto mt-2">{L.empty.description}</Text>
                            <Button onClick={() => router.push(targetId ? `/target/${targetId}/database-schema/create` : '/database-schema/create')}>{L.buttons.createSchema}</Button>
                        </div>
                    ) : (
                        (sources || []).map((src: any) => (
                            <TableCard
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
                variant="destructive"
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

interface TableCardProps {
    source: DatabaseTable;
    isExpanded: boolean;
    resources: Resource[];
    loadingResources: boolean;
    onToggleExpand: () => void;
    onClone: () => void;
    onDelete: () => void;
    onDeleteResource: (id: number, name: string) => void;
    router: { push: (href: string) => void };
}

const TableCard = ({
    source,
    isExpanded,
    resources,
    loadingResources,
    onToggleExpand,
    onClone,
    onDelete,
    onDeleteResource,
    router,
}: TableCardProps) => {
    return (
        <div
            className={cn(
                "group bg-card rounded-xl transition-all duration-200 overflow-hidden",
                isExpanded
                    ? 'ring-1 ring-primary/20'
                    : 'border border-border hover:border-border'
            )}
        >
            {/* Card Header / Main Row */}
            <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-5 cursor-pointer" onClick={onToggleExpand}>
                {/* Icon & Title */}
                <Stack direction="row" align="center" gap={4} className="flex-1 min-w-0">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                        isExpanded ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}>
                        <Icons.database className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Stack direction="row" align="center" gap={2} className="mb-0.5">
                            <Heading level={5} className="truncate">{source.name}</Heading>
                            {source.isSystem && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-auto">{L.labels.system}</Badge>
                            )}
                        </Stack>
                        <Stack direction="row" wrap align="center" gap={2} className="text-xs text-muted-foreground">
                            <span className="font-mono text-[10px] bg-muted border border-border px-1.5 rounded text-muted-foreground">{source.tableName}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{source.rowCount || 0} {L.labels.records.toLowerCase()}</span>
                        </Stack>
                    </div>
                </Stack>

                <Stack direction="row" align="center" gap={2} className="justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={isExpanded ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20" : "text-muted-foreground hover:text-foreground"}
                    >
                        {isExpanded ? L.buttons.hideResources : L.buttons.viewResources}
                    </Button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClone(); }}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                        title={L.buttons.cloneSchema}
                    >
                        <Icons.copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                        title={L.buttons.deleteSchema}
                    >
                        <Icons.delete className="w-4 h-4" />
                    </button>
                </Stack>
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
    const { id: targetId } = useParams();
    
    return (
        <div className="bg-muted/30 border-t border-border p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Stack direction="row" align="center" gap={3}>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icons.table className="w-5 h-5" /></div>
                        <div>
                            <Heading level={5}>{L.labels.tableData}</Heading>
                            <Text variant="muted" className="text-xs">{L.labels.viewAndManageRecords}</Text>
                        </div>
                    </Stack>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto justify-center gap-2 text-primary hover:bg-primary/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(targetId ? `/target/${targetId}/database-schema/${sourceId}/data` : `/database-schema/${sourceId}/data`);
                        }}
                    >
                        {L.buttons.viewData} <Icons.arrowRight className="w-3 h-3" />
                    </Button>
                </Card>

                <Card  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Stack direction="row" align="center" gap={3}>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icons.clipboardList className="w-5 h-5" /></div>
                        <div>
                            <Heading level={5}>{L.labels.schema}</Heading>
                            <Text variant="muted" className="text-xs">{L.labels.editColumnsTypes}</Text>
                        </div>
                    </Stack>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto justify-center gap-2 text-primary hover:bg-primary/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(targetId ? `/target/${targetId}/database-schema/${sourceId}/schema` : `/database-schema/${sourceId}/schema`);
                        }}
                    >
                        {L.buttons.editSchema} <Icons.arrowRight className="w-3 h-3" />
                    </Button>
                </Card>

                {/* Relations Card */}
                <Card  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:col-span-2 lg:col-span-1">
                    <Stack direction="row" align="center" gap={3}>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icons.link className="w-5 h-5" /></div>
                        <div>
                            <Heading level={5}>{L.messages?.relations?.title || 'Relations'}</Heading>
                            <Text variant="muted" className="text-xs">{L.messages?.relations?.addRelation || 'Connect tables'}</Text>
                        </div>
                    </Stack>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto justify-center gap-2 text-primary hover:bg-primary/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(targetId ? `/target/${targetId}/database-schema/${sourceId}/relations/create` : `/database-schema/${sourceId}/relations/create`);
                        }}
                    >
                        <Icons.plus className="w-3 h-3" />
                        {L.buttons?.addRelation || "Add"}
                    </Button>
                </Card>
            </div>

            {/* Relations List Section */}
            <div className="mb-8">
                <RelationBuilder
                    DatabaseTableId={sourceId}
                    DatabaseTableName={sourceName}
                />
            </div>

            <Stack direction="row" justify="between" align="center" className="mb-6">
                <Stack direction="row" align="center" gap={2}>
                    <span className="text-primary font-semibold bg-primary/10 px-3 py-1 rounded-lg text-sm">{L.labels.apiResources}</span>
                    {loadingResources && <Icons.loading className="w-4 h-4 animate-spin text-primary/60" />}
                </Stack>
                <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(targetId ? `/target/${targetId}/database-schema/${sourceId}/resources/create` : `/database-schema/${sourceId}/resources/create`);
                    }}
                >
                    + {L.buttons.createResource}
                </Button>
            </Stack>

            {
                loadingResources ? (
                    <div className="h-20 bg-muted rounded-xl animate-pulse"></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.length === 0 ? (
                            <div className="col-span-full border-2 border-dashed border-border rounded-2xl p-8 text-center bg-card">
                                <Text variant="muted" className="mb-2">{L.labels.noEndpointsConfigured}</Text>
                                <span className="text-xs text-muted-foreground">{L.labels.createResourceToExpose}</span>
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
    const { id: targetId } = useParams();
    const hasFilters = r.filtersJson
        ? (JSON.parse(r.filtersJson)?.filters?.length > 0 || (Array.isArray(JSON.parse(r.filtersJson)) && JSON.parse(r.filtersJson).length > 0))
        : false;
    const hasJoins = r.joinsJson ? (JSON.parse(r.joinsJson)?.length > 0) : false;

    return (
        <Card
            
            className="p-4 cursor-pointer flex flex-col h-full"
            onClick={(e) => {
                e.stopPropagation();
                router.push(targetId ? `/target/${targetId}/database-schema/${sourceId}/resources/${r.id}/edit` : `/database-schema/${sourceId}/resources/${r.id}/edit`);
            }}
        >
            <Stack direction="row" justify="between" align="start" className="mb-3">
                <Stack direction="row" align="center" gap={2}>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        GET
                    </div>
                    {hasJoins && (
                        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center" title={L.labels.hasJoins}><Icons.link className="w-3 h-3" /></div>
                    )}
                </Stack>

                {/* Actions - Always Visible */}
                <Stack direction="row" align="center" gap={1} className="opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                        className="p-1.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(targetId ? `/target/${targetId}/database-schema/${sourceId}/resources/${r.id}/edit` : `/database-schema/${sourceId}/resources/${r.id}/edit`);
                        }}
                    >
                        <Icons.edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                        className="p-1.5 hover:bg-red-50 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Icons.delete className="w-3.5 h-3.5" />
                    </button>
                </Stack>
            </Stack>

            <div className="flex-1 min-w-0">
                <Heading level={5} className="mb-1 group-hover/card:text-primary transition-colors truncate" title={r.name}>
                    {r.name}
                </Heading>
                <Stack direction="row" align="center" gap={2} className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-fit mb-3 border border-border">
                    <span className="font-medium text-muted-foreground">/{r.slug}</span>
                </Stack>
            </div>

            {/* Feature Badges & Status */}
            <Stack direction="row" wrap gap={2} className="mt-auto pt-3 border-t border-border">
                <Badge variant={r.isPublic ? 'warning' : 'success'} className="px-1.5 py-0 h-5 text-[10px]">
                    {r.isPublic ? L.labels.public : L.labels.protected}
                </Badge>

                {hasFilters && <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center">{L.labels.filters}</span>}

                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center", r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                    {r.isActive ? L.labels.active : L.labels.draft}
                </span>
            </Stack>
        </Card>
    );
};
