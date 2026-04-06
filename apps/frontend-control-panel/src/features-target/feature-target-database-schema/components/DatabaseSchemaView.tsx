'use client';

/**
 * databaseSchemaView - Enhanced with Flat Luxury UI
 * Integrated with TargetLayout and consistent Design System
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { useDatabaseSchema, useSchemaActions, useResources, useSchemaStats } from '../composables';
import { ConfirmDialog, PageLoadingSkeleton } from '@/modules/_core';
import { RelationBuilder } from './RelationBuilder';
import type { DatabaseTable, Resource } from '../types';

const L = MODULE_LABELS.databaseSchema;

export const DatabaseSchemaView = () => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;

    // Data from composables
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

    // UI handlers
    const toggleExpand = (id: number) => {
        setExpandedId(prev => (prev === id ? null : id));
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

    if (loading && !sources) return <PageLoadingSkeleton showStats={true} contentRows={3} />;

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter">
                {/* Header & Stats */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                    <div className="space-y-1">
                        <TextHeading as="h1" size="h3">{L.title}</TextHeading>
                        <p className="text-sm md:text-base text-muted-foreground lowercase">{L.subtitle.toLowerCase()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-border/40 hover:bg-muted/50 text-muted-foreground lowercase"
                            onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/trash` : '/database-schema/trash')}
                        >
                            <Icons.trash className="w-4 h-4 mr-2" /> {L.labels.trash}
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-xl shadow-lg shadow-primary/10 lowercase"
                            onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/create` : '/database-schema/create')}
                        >
                            <Icons.plus className="w-4 h-4 mr-2" />
                            {L.buttons.createSchema}
                        </Button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                    <StatCard 
                        label={L.labels.sources} 
                        value={stats.total_sources} 
                        subtitle={L.labels.activeConnections} 
                        icon={Icons.bookOpen} 
                    />
                    <StatCard 
                        label={L.labels.tables} 
                        value={stats.total_tables} 
                        subtitle={L.labels.schemasDefined} 
                        icon={Icons.storage} 
                    />
                    <StatCard 
                        label={L.labels.records} 
                        value={(stats.total_records || 0).toLocaleString()} 
                        subtitle={L.labels.totalRows} 
                        icon={Icons.chart} 
                    />
                    
                    {/* Create New CTA Card */}
                    <div 
                        className="bg-muted/30 hover:bg-muted/50 border border-dashed border-border/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/create` : '/database-schema/create')}
                    >
                        <div className="size-10 rounded-xl bg-background border border-border/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Icons.plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary lowercase">{L.buttons.createSchema}</span>
                    </div>
                </div>

                {/* Main List Section */}
                <div className="space-y-4 px-1 pb-10">
                    {sources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border/40">
                            <div className="size-20 rounded-3xl bg-muted/40 flex items-center justify-center mb-6">
                                <Icons.folderOpen className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <TextHeading size="h5" className="mb-2">{L.empty.title.toLowerCase()}</TextHeading>
                            <p className="text-sm text-muted-foreground max-w-sm lowercase mb-8">
                                {L.empty.description.toLowerCase()}
                            </p>
                            <Button 
                                className="rounded-xl px-8 lowercase"
                                onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/create` : '/database-schema/create')}
                            >
                                {L.buttons.createSchema}
                            </Button>
                        </div>
                    ) : (
                        sources.map((src: any) => (
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
                                nodeId={nodeId}
                            />
                        ))
                    )}
                </div>

                <ConfirmDialog
                    isOpen={!!confirmDialog}
                    onConfirm={handleDelete}
                    onClose={() => setConfirmDialog(null)}
                    variant="destructive"
                    title={confirmDialog?.type === 'resource'
                        ? `delete resource?`
                        : `delete database schema?`}
                    message={confirmDialog?.type === 'resource'
                        ? L.messages.confirm.deleteResource.toLowerCase()
                        : L.messages.confirm.deleteSource.toLowerCase()}
                    loading={submitting}
                />
            </div>
        </TargetLayout>
    );
};

// =============================================================================
// Helper Components
// =============================================================================

const StatCard = ({ label, value, subtitle, icon: Icon }: any) => (
    <Card className="bg-card/40 border-none shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{label}</span>
                <div className="size-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
                <p className="text-[11px] text-muted-foreground lowercase">{subtitle}</p>
            </div>
        </CardContent>
    </Card>
);

const TableCard = ({
    source,
    isExpanded,
    resources,
    loadingResources,
    onToggleExpand,
    onClone,
    onDelete,
    onDeleteResource,
    nodeId,
}: any) => {
    const router = useRouter();

    return (
        <Card 
            className={cn(
                "group border-none shadow-sm overflow-hidden transition-all duration-300",
                isExpanded ? 'ring-1 ring-primary/20 bg-muted/5' : 'bg-card hover:bg-muted/10'
            )}
        >
            <div 
                className="p-5 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer" 
                onClick={onToggleExpand}
            >
                {/* Visual ID & Icon */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0",
                        isExpanded ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}>
                        <Icons.database className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <TextHeading size="h5" className="text-base font-semibold truncate lowercase leading-none">
                                {source.name}
                            </TextHeading>
                            {source.isSystem && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 h-4 uppercase font-bold tracking-tighter bg-muted/50 border-none">SYSTEM</Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground lowercase font-medium">
                            <span className="font-mono text-[10px] text-primary/70 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">{source.tableName}</span>
                            <span className="opacity-30">•</span>
                            <span>{source.rowCount || 0} {L.labels.records.toLowerCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 rounded-xl px-4 text-xs font-medium lowercase transition-all",
                            isExpanded ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        {isExpanded ? L.buttons.hideResources : L.buttons.viewResources}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); onClone(); }}
                            className="rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title={L.buttons.cloneSchema}
                        >
                            <Icons.copy className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                            title={L.buttons.deleteSchema}
                        >
                            <Icons.trash className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Resources Disclosure Panel */}
            {isExpanded && (
                <CardContent className="p-0 border-t border-border/5">
                    <ExpandedResourcesPanel
                        sourceId={source.id}
                        sourceName={source.name}
                        resources={resources}
                        loadingResources={loadingResources}
                        onDeleteResource={onDeleteResource}
                        nodeId={nodeId}
                    />
                </CardContent>
            )}
        </Card>
    );
};

const ExpandedResourcesPanel = ({
    sourceId,
    sourceName,
    resources,
    loadingResources,
    onDeleteResource,
    nodeId,
}: any) => {
    const router = useRouter();
    
    return (
        <div className="p-6 md:p-8 bg-muted/20 space-y-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionShortcut 
                    title={L.labels.tableData} 
                    desc={L.labels.viewAndManageRecords} 
                    icon={Icons.table} 
                    buttonText={L.buttons.viewData}
                    onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/${sourceId}/data` : `/database-schema/${sourceId}/data`)}
                />
                <ActionShortcut 
                    title={L.labels.schema} 
                    desc={L.labels.editColumnsTypes} 
                    icon={Icons.clipboardList} 
                    buttonText={L.buttons.editSchema}
                    onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/${sourceId}/schema` : `/database-schema/${sourceId}/schema`)}
                />
                <ActionShortcut 
                    title={L.messages?.relations?.title || 'Relations'} 
                    desc={L.messages?.relations?.addRelation || 'Connect tables'} 
                    icon={Icons.link} 
                    buttonText={L.buttons?.addRelation || "Add"}
                    onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/${sourceId}/relations/create` : `/database-schema/${sourceId}/relations/create`)}
                />
            </div>

            {/* Relations Section - Keeping the builder */}
            <div className="px-1 pt-2">
                <RelationBuilder
                    DatabaseTableId={sourceId}
                    DatabaseTableName={sourceName}
                />
            </div>

            {/* CMS Resources Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icons.api className="w-4 h-4" />
                        </div>
                        <TextHeading size="h6" className="text-sm font-semibold lowercase">API Endpoints</TextHeading>
                        {loadingResources && <Icons.loading className="w-3.5 h-3.5 animate-spin text-muted-foreground/40" />}
                    </div>
                    <Button
                        size="sm"
                        className="rounded-xl h-9 lowercase shadow-sm"
                        onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/${sourceId}/resources/create` : `/database-schema/${sourceId}/resources/create`)}
                    >
                        <Icons.plus className="w-3.5 h-3.5 mr-2" />
                        {L.buttons.createResource}
                    </Button>
                </div>

                {loadingResources && resources.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.length === 0 ? (
                            <div className="col-span-full border border-dashed border-border/20 rounded-2xl py-12 flex flex-col items-center justify-center text-center bg-background/20">
                                <p className="text-sm text-muted-foreground lowercase mb-1">{L.labels.noEndpointsConfigured.toLowerCase()}</p>
                                <span className="text-[10px] text-muted-foreground/50 lowercase">{L.labels.createResourceToExpose.toLowerCase()}</span>
                            </div>
                        ) : (
                            resources.map((r: any) => (
                                <ResourceCard
                                    key={r.id}
                                    resource={r}
                                    sourceId={sourceId}
                                    onDelete={() => onDeleteResource(r.id, r.name)}
                                    nodeId={nodeId}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

const ActionShortcut = ({ title, desc, icon: Icon, buttonText, onClick }: any) => (
    <Card className="bg-background/60 border-none shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <TextHeading size="h6" className="text-sm font-semibold lowercase mb-0.5">{title}</TextHeading>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 lowercase">{desc}</p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-3 text-[10px] font-bold lowercase text-primary hover:bg-primary/5 shrink-0"
                onClick={onClick}
            >
                {buttonText} <Icons.chevronRight className="w-3 h-3 ml-1.5" />
            </Button>
        </CardContent>
    </Card>
);

const ResourceCard = ({ resource: r, sourceId, onDelete, nodeId }: any) => {
    const router = useRouter();
    const hasFilters = r.filtersJson
        ? (JSON.parse(r.filtersJson)?.filters?.length > 0 || (Array.isArray(JSON.parse(r.filtersJson)) && JSON.parse(r.filtersJson).length > 0))
        : false;
    const hasJoins = r.joinsJson ? (JSON.parse(r.joinsJson)?.length > 0) : false;

    return (
        <Card
            className="group relative bg-background/80 border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-4 overflow-hidden"
            onClick={(e) => {
                e.stopPropagation();
                router.push(nodeId ? `/target/${nodeId}/database-schema/${sourceId}/resources/${r.id}/edit` : `/database-schema/${sourceId}/resources/${r.id}/edit`);
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 px-1.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-black flex items-center justify-center">
                        GET
                    </div>
                    {hasJoins && (
                        <div className="size-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center" title={L.labels.hasJoins}>
                            <Icons.link className="w-3 h-3" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-md hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(nodeId ? `/target/${nodeId}/database-schema/${sourceId}/resources/${r.id}/edit` : `/database-schema/${sourceId}/resources/${r.id}/edit`);
                        }}
                    >
                        <Icons.edit className="w-3 h-3 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-md hover:bg-rose-500/10 hover:text-rose-500"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <Icons.trash className="w-3 h-3 text-muted-foreground hover:text-inherit" />
                    </Button>
                </div>
            </div>

            <div className="mb-4 space-y-1">
                <TextHeading size="h6" className="text-sm font-semibold truncate lowercase group-hover:text-primary transition-colors">
                    {r.name}
                </TextHeading>
                <div className="font-mono text-[9px] text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded w-fit uppercase tracking-tight">
                    /{r.slug}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/5">
                <Badge variant="outline" className={cn(
                    "text-[9px] px-1.5 py-0 h-4 border-none uppercase font-bold",
                    r.isPublic ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                )}>
                    {r.isPublic ? L.labels.public : L.labels.protected}
                </Badge>

                {hasFilters && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-none uppercase font-bold">
                        {L.labels.filters}
                    </Badge>
                )}

                <Badge variant="outline" className={cn(
                    "text-[9px] px-1.5 py-0 h-4 border-none uppercase font-bold",
                    r.isActive ? 'bg-indigo-500/10 text-indigo-600' : 'bg-muted/50 text-muted-foreground/60'
                )}>
                    {r.isActive ? L.labels.active : L.labels.draft}
                </Badge>
            </div>
        </Card>
    );
};
