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
import { TargetLayout } from '@/components/layout/TargetLayout';
import { useDatabaseSchema, useSchemaActions, useResources, useSchemaStats } from '../composables';
import { ConfirmDialog, PageLoadingSkeleton } from '@/modules/_core';
import { RelationBuilder } from './RelationBuilder';
import { FEATURE_LABELS, FEATURE_ICONS as Icons } from '../constants';
import type { DatabaseTable, Resource } from '../types';

const L = FEATURE_LABELS;

export function DatabaseSchemaView() {
  const router = useRouter();
  const params = useParams();
  const nodeId = params?.id as string;

  // Data from composables
  const { items: sources = [], loading, remove, fetchAll } = useDatabaseSchema();
  const { clone } = useSchemaActions();

  // Resource Expansion State
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const {
    items: resources = [],
    loading: loadingResources,
    remove: removeResource,
  } = useResources(expandedId);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    id: string | number;
    name: string;
    type?: 'source' | 'resource';
    sourceId?: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Server-side Stats
  const { stats } = useSchemaStats();

  // UI handlers
  const toggleExpand = (id: string | number) => {
    setExpandedId((prev) => (prev === id ? null : id));
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

  if (loading && !sources.length) {
    return (
      <TargetLayout>
        <div className="w-full flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            <span className="text-base text-muted-foreground font-medium lowercase">
              synchronizing database schema...
            </span>
          </div>
        </div>
      </TargetLayout>
    );
  }

  return (
    <TargetLayout>
      <div className="flex flex-col gap-10 animate-page-enter">
        {/* Header & Stats */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
            <TextHeading as="h1" size="h3">
              {L.title}
            </TextHeading>
            <p className="text-sm md:text-base text-muted-foreground lowercase">
              {L.subtitle.toLowerCase()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  nodeId ? `/target/${nodeId}/database-schema/trash` : '/database-schema/trash',
                )
              }
            >
              <Icons.trash className="w-4 h-4 mr-2" /> {L.labels.trash}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                router.push(
                  nodeId ? `/target/${nodeId}/database-schema/create` : '/database-schema/create',
                )
              }
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
            value={(stats.totalSources ?? 0).toLocaleString()}
            subtitle={L.labels.activeConnections}
            icon={Icons.bookOpen}
          />
          <StatCard
            label={L.labels.tables}
            value={(stats.totalTables ?? 0).toLocaleString()}
            subtitle={L.labels.schemasDefined}
            icon={Icons.storage}
          />
          <StatCard
            label={L.labels.records}
            value={(stats.totalRecords ?? 0).toLocaleString()}
            subtitle={L.labels.totalRows}
            icon={Icons.chart}
          />

          {/* Create New CTA Card */}
          <Card
            size="sm"
            className="bg-background flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group"
            onClick={() =>
              router.push(
                nodeId ? `/target/${nodeId}/database-schema/create` : '/database-schema/create',
              )
            }
          >
            <CardContent className="flex flex-col items-center justify-center w-full py-6">
              <div className="size-12 rounded-2xl bg-primary border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-primary lowercase tracking-tight">
                {L.buttons.createSchema}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Main List Section */}
        <div className="space-y-4 px-1 pb-10">
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 bg-muted/20 rounded-md">
              <div className="size-20 rounded-3xl bg-background border border-border flex items-center justify-center mb-6 shadow-sm">
                <Icons.folderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <TextHeading size="h5" className="mb-2 text-foreground font-semibold">
                {L.empty.title.toLowerCase()}
              </TextHeading>
              <p className="text-sm text-muted-foreground max-w-sm lowercase mb-8">
                {L.empty.description.toLowerCase()}
              </p>
              <Button
                onClick={() =>
                  router.push(
                    nodeId ? `/target/${nodeId}/database-schema/create` : '/database-schema/create',
                  )
                }
                variant="default"
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
                onDeleteResource={(resourceId: number, resourceName: string) =>
                  setConfirmDialog({
                    id: resourceId,
                    name: resourceName,
                    type: 'resource',
                    sourceId: src.id,
                  })
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
          variant="danger"
          title={
            confirmDialog?.type === 'resource' ? `delete resource?` : `delete database schema?`
          }
          message={
            confirmDialog?.type === 'resource'
              ? L.messages.confirm.deleteResource.toLowerCase()
              : L.messages.confirm.deleteSource.toLowerCase()
          }
          loading={submitting}
        />
      </div>
    </TargetLayout>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

function StatCard({ label, value, subtitle, icon: Icon }: any) {
  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Icon className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          <p className="text-sm text-muted-foreground lowercase font-normal">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableCard({
  source,
  isExpanded,
  resources,
  loadingResources,
  onToggleExpand,
  onClone,
  onDelete,
  onDeleteResource,
  nodeId,
}: any) {
  const router = useRouter();

  return (
    <Card size="sm">
      <CardContent
        className="flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Visual ID & Icon */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div
            className={cn(
              'size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0',
              isExpanded
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
            )}
          >
            <Icons.database className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TextHeading size="h5" className="lowercase">
                {source.name}
              </TextHeading>
              {source.isSystem && <Badge variant="secondary">SYSTEM</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground lowercase font-normal">
              <span className="font-mono text-[11px] text-primary/80 bg-primary/5 px-2.5 py-0.5 rounded-lg border border-primary/10">
                {source.tableName}
              </span>
              <span className="opacity-30">•</span>
              <span>
                {source.rowCount || 0} {L.labels.records.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm">
            {isExpanded ? L.buttons.hideResources : L.buttons.viewResources}
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              title={L.buttons.cloneSchema}
            >
              <Icons.copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={L.buttons.deleteSchema}
            >
              <Icons.trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>

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
}

function ExpandedResourcesPanel({
  sourceId,
  sourceName,
  resources = [],
  loadingResources,
  onDeleteResource,
  nodeId,
}: any) {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6 bg-muted/20 space-y-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionShortcut
          title={L.labels.tableData}
          desc={L.labels.viewAndManageRecords}
          icon={Icons.table}
          label={L.buttons.viewData}
          actionIcon={Icons.externalLink}
          action={() =>
            router.push(
              nodeId
                ? `/target/${nodeId}/database-schema/${sourceId}/data`
                : `/database-schema/${sourceId}/data`,
            )
          }
        />
        <ActionShortcut
          title={L.labels.schema}
          desc={L.labels.editColumnsTypes}
          icon={Icons.clipboardList}
          label={L.buttons.editSchema}
          actionIcon={Icons.edit}
          action={() =>
            router.push(
              nodeId
                ? `/target/${nodeId}/database-schema/${sourceId}/schema`
                : `/database-schema/${sourceId}/schema`,
            )
          }
        />
        <ActionShortcut
          title={L.messages?.relations?.title || 'Relations'}
          desc={L.messages?.relations?.addRelation || 'Connect tables'}
          icon={Icons.link}
          label={L.buttons?.addRelation || 'Add'}
          actionIcon={Icons.plus}
          action={() =>
            router.push(
              nodeId
                ? `/target/${nodeId}/database-schema/${sourceId}/relations/create`
                : `/database-schema/${sourceId}/relations/create`,
            )
          }
        />
      </div>

      {/* Relations Section - Keeping the builder */}
      <RelationBuilder DatabaseTableId={sourceId} DatabaseTableName={sourceName} />

      {/* CMS Resources Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Icons.api className="w-4 h-4" />
            </div>
            <TextHeading size="h6" className="lowercase">
              API Endpoints
            </TextHeading>
            {loadingResources && (
              <Icons.loading className="w-3.5 h-3.5 animate-spin text-muted-foreground/40" />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(
                nodeId
                  ? `/target/${nodeId}/database-schema/${sourceId}/resources/create`
                  : `/database-schema/${sourceId}/resources/create`,
              )
            }
            title={L.buttons.createResource}
          >
            <Icons.plus className="w-4 h-4" />
          </Button>
        </div>

        {loadingResources && resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="size-8 border-[3px] border-primary/20 border-t-primary animate-spin rounded-full" />
            <span className="text-sm text-muted-foreground lowercase">fetching resources...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.length === 0 ? (
              <div className="col-span-full border border-dashed border-border/20 rounded-2xl py-12 flex flex-col items-center justify-center text-center bg-background/20">
                <p className="text-sm text-muted-foreground lowercase mb-1">
                  {L.labels.noEndpointsConfigured.toLowerCase()}
                </p>
                <span className="text-[10px] text-muted-foreground/50 lowercase">
                  {L.labels.createResourceToExpose.toLowerCase()}
                </span>
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
    </div>
  );
}

function ActionShortcut({
  title,
  desc,
  icon: Icon,
  action,
  label,
  actionIcon: ActionIcon = Icons.chevronRight,
  variant = 'ghost',
}: any) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <TextHeading size="h6" className="lowercase mb-1">
              {title}
            </TextHeading>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 lowercase font-normal">
              {desc}
            </p>
          </div>
        </div>
        <Button
          variant={variant}
          size="icon"
          className="size-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5"
          onClick={action}
          title={label}
        >
          <ActionIcon className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ResourceCard({ resource: r, sourceId, onDelete, nodeId }: any) {
  const router = useRouter();

  // Safely parse JSON properties with fallbacks
  const parseJson = (val: any) => {
    if (!val) return null;
    try {
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch (e) {
      console.error('Failed to parse JSON field', e);
      return null;
    }
  };

  const filters = parseJson(r.filtersJson || r.filters_json);
  const hasFilters = filters
    ? filters.filters?.length > 0 || (Array.isArray(filters) && filters.length > 0)
    : false;

  const joins = parseJson(r.joinsJson || r.joins_json);
  const hasJoins = joins ? joins.length > 0 : false;

  const handleEdit = () => {
    router.push(
      nodeId
        ? `/target/${nodeId}/database-schema/${sourceId}/resources/${r.id}/edit`
        : `/database-schema/${sourceId}/resources/${r.id}/edit`,
    );
  };

  return (
    <Card size="sm" onClick={handleEdit}>
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-emerald-600 bg-emerald-500/10 border-none font-semibold uppercase"
            >
              GET
            </Badge>
            {hasJoins && (
              <div
                className="size-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center"
                title={L.labels.hasJoins}
              >
                <Icons.link className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon-xs" onClick={handleEdit}>
              <Icons.edit className="w-3 h-3 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Icons.trash className="w-3 h-3 text-muted-foreground hover:text-rose-500 transition-colors" />
            </Button>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <TextHeading size="h6" className="lowercase">
            {r.name}
          </TextHeading>
          <div className="font-mono text-[9px] text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded w-fit uppercase">
            /{r.slug}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/5">
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] px-1.5 py-0 h-4 border-none uppercase font-semibold',
              r.isPublic || r.is_public
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-emerald-500/10 text-emerald-600',
            )}
          >
            {r.isPublic || r.is_public ? L.labels.public : L.labels.protected}
          </Badge>

          {hasFilters && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-none uppercase font-semibold"
            >
              {L.labels.filters}
            </Badge>
          )}

          <Badge
            variant="outline"
            className={cn(
              'text-[9px] px-1.5 py-0 h-4 border-none uppercase font-semibold',
              r.isActive || r.is_active
                ? 'bg-indigo-500/10 text-indigo-600'
                : 'bg-muted/50 text-muted-foreground/60',
            )}
          >
            {r.isActive || r.is_active ? L.labels.active : L.labels.draft}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
