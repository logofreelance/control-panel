'use client';

/**
 * databaseSchemaView - Enhanced with Flat Luxury UI
 * Integrated with TargetLayout and consistent Design System
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  Input, 
  Textarea, 
  Field, 
  FieldLabel,
  Modal
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { useDatabaseSchema, useSchemaActions, useResources, useSchemaStats, useDatabaseCategories } from '../composables';
import { ConfirmDialog, PageLoadingSkeleton } from '@/modules/_core';
import { RelationBuilder } from './RelationBuilder';
import { CategoryManager } from './CategoryManager';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { env } from '@/lib/env';
import type { DatabaseTable, Resource } from '../types';

const L = MODULE_LABELS.databaseSchema;

export function DatabaseSchemaView() {
  const router = useRouter();
  const params = useParams();
  const nodeId = params?.id as string;

  // Data from composables
  const { items: sources = [], loading, remove, fetchAll, update } = useDatabaseSchema();
  const { items: categories = [], loading: loadingCategories, fetchAll: fetchCategories } = useDatabaseCategories();
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

  // Category State
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingSchema, setEditingSchema] = useState<DatabaseTable | null>(null);

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
              onClick={() => setShowCategoryManager(true)}
            >
              <Icons.layers className="w-4 h-4 mr-2" /> categories
            </Button>
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
            value={(stats.activeSources ?? 0).toLocaleString()}
            subtitle={L.labels.activeConnections}
            icon={Icons.bookOpen}
          />
          <StatCard
            label={L.labels.tables}
            value={(stats.activeSources ?? 0).toLocaleString()}
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

        {/* Main List Section - Grouped by Category */}
        <div className="space-y-12 px-1 pb-10">
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
            // Grouping Logic
            ([
              // First: Uncategorized or specific order
              { id: 'all', name: 'general schemas', items: sources.filter(s => !s.categoryId), color: undefined, icon: undefined },
              // Then: Categorized
              ...categories.map(cat => ({
                id: String(cat.id),
                name: cat.name,
                color: cat.color,
                icon: cat.icon,
                items: sources.filter(s => String(s.categoryId) === String(cat.id))
              }))
            ] as any[]).filter(group => group.items.length > 0).map((group) => (
              <div key={group.id} className="space-y-5 animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 px-2">
                   <div className={cn(
                     "size-8 rounded-lg flex items-center justify-center text-sm",
                     group.color ? `bg-opacity-10` : "bg-muted/50"
                   )} style={{ backgroundColor: group.color ? `${group.color}20` : undefined, color: group.color }}>
                      {(() => {
                        const IconComp = (Icons as any)[group.icon] || Icons.layers;
                        return <IconComp className="size-4" />;
                      })()}
                   </div>
                   <TextHeading size="h6" className="font-bold lowercase tracking-tight opacity-60">
                     {group.name}
                   </TextHeading>
                   <div className="h-px flex-1 bg-border/40 ml-2" />
                </div>

                <div className="space-y-4">
                  {group.items.map((src: any) => (
                    <TableCard
                      key={src.id}
                      source={src}
                      categories={categories}
                      isExpanded={expandedId === src.id}
                      resources={expandedId === src.id ? resources : []}
                      loadingResources={loadingResources}
                      onToggleExpand={() => toggleExpand(src.id)}
                      onClone={() => handleClone(src.id)}
                      onEditMetadata={() => setEditingSchema(src)}
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
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Category Manager */}
        <Modal
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          title="manage database categories"
          className="sm:max-w-xl"
        >
          <CategoryManager onUpdate={fetchCategories} />
        </Modal>

        {/* Modal: Edit Schema Metadata (including Category) */}
        <Modal
          isOpen={!!editingSchema}
          onClose={() => setEditingSchema(null)}
          title="edit schema metadata"
        >
          {editingSchema && (
            <EditSchemaMetadataForm 
              schema={editingSchema} 
              categories={categories} 
              onClose={() => {
                setEditingSchema(null);
                fetchAll();
              }} 
            />
          )}
        </Modal>

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
  categories,
  isExpanded,
  resources,
  loadingResources,
  onToggleExpand,
  onClone,
  onEditMetadata,
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
            style={{ 
              backgroundColor: !isExpanded && source.categoryColor ? `${source.categoryColor}15` : undefined,
              color: !isExpanded && source.categoryColor ? source.categoryColor : undefined,
              borderColor: !isExpanded && source.categoryColor ? `${source.categoryColor}30` : undefined,
            }}
          >
            {(() => {
              const IconComp = (Icons as any)[source.categoryIcon] || Icons.database;
              return <IconComp className="w-6 h-6" />;
            })()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TextHeading size="h5" className="lowercase">
                {source.name}
              </TextHeading>
              {source.isSystem && <Badge variant="secondary">SYSTEM</Badge>}
              {source.categoryName && (
                <Badge 
                  variant="outline" 
                  className="lowercase text-[10px] font-normal border-opacity-20"
                  style={{ color: source.categoryColor, borderColor: source.categoryColor, backgroundColor: `${source.categoryColor}10` }}
                >
                  {source.categoryName}
                </Badge>
              )}
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
                onEditMetadata();
              }}
              title="edit metadata & category"
            >
              <Icons.settings className="w-4 h-4" />
            </Button>
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
          actionIcon={Icons.external}
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
      <div className="space-y-6 flex flex-col gap-8">
        <div>
          <div className="flex items-center justify-between px-1 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icons.database className="w-4 h-4" />
              </div>
              <TextHeading size="h6" className="lowercase">
                resource logic
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
            <div className="flex flex-col gap-3">
              {resources.length === 0 ? (
                <div className="border border-dashed border-border/20 rounded-2xl py-12 flex flex-col items-center justify-center text-center bg-background/20">
                  <p className="text-sm text-muted-foreground lowercase mb-1">
                    no resource logic configured
                  </p>
                  <span className="text-[10px] text-muted-foreground/50 lowercase">
                    create a resource logic to define filters and rules
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

        {/* Dynamic Routes Section */}
        <EndpointListSection sourceId={sourceId} nodeId={nodeId} />
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
    <Card size="sm" className="group">
      <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
        {/* Info & Status */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-none font-bold text-emerald-600 bg-emerald-500/10 min-w-10 flex justify-center"
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

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <TextHeading size="h6" className="lowercase truncate">
                {r.name}
              </TextHeading>
              <div className="font-mono text-[10px] text-muted-foreground/40 lowercase">
                /{r.slug}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 border-l border-border/5 pl-4 ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs font-medium lowercase"
            onClick={handleEdit}
          >
            <Icons.edit className="w-3 h-3 mr-2" />
            edit logic
          </Button>
          
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icons.trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// NEW: Endpoint List Section for displaying Dynamic Routes referencing this Database
// ----------------------------------------------------------------------

function EndpointListSection({ sourceId, nodeId }: { sourceId: string | number; nodeId: string }) {
  const router = useRouter();
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchEndpoints = async () => {
      try {
        setLoading(true);
        const targetId = Array.isArray(nodeId) ? nodeId[0] : (nodeId || '');
        const res = await fetch(`${env.API_URL}/route-builder/page-schema-view/endpoints`, {
          headers: { 'x-target-id': targetId },
        });
        const data = await res.json();
        
        if (data.status === 'success' && Array.isArray(data.data) && active) {
          // Filter to those that reference this sourceId
          const filtered = data.data.filter(
            (ep: any) => String(ep.dataSourceId) === String(sourceId)
          );
          setEndpoints(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch endpoints', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    if (sourceId) {
      fetchEndpoints();
    }
    
    return () => { active = false; };
  }, [sourceId, nodeId]);

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icons.api className="w-4 h-4" />
          </div>
          <TextHeading size="h6" className="lowercase">
            api endpoints
          </TextHeading>
          {loading && (
            <Icons.loading className="w-3.5 h-3.5 animate-spin text-muted-foreground/40" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(
              nodeId
                ? `/target/${nodeId}/routes`
                : `/routes`,
            )
          }
          title="go to endpoints builder"
        >
          <Icons.external className="w-4 h-4" />
        </Button>
      </div>

      {loading && endpoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="size-8 border-[3px] border-primary/20 border-t-primary animate-spin rounded-full" />
          <span className="text-sm text-muted-foreground lowercase">fetching endpoints...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {endpoints.length === 0 ? (
            <div className="col-span-full border border-dashed border-border/20 rounded-2xl py-12 flex flex-col items-center justify-center text-center bg-background/20 mt-2">
              <p className="text-sm text-muted-foreground lowercase mb-1">
                no api endpoints configured.
              </p>
              <span className="text-[10px] text-muted-foreground/50 lowercase">
                create an endpoint in route builder to expose this schema
              </span>
            </div>
          ) : (
            endpoints.map((ep: any) => (
              <EndpointSimpleCard
                key={ep.id}
                endpoint={ep}
                nodeId={nodeId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EndpointSimpleCard({ endpoint: ep, nodeId }: { endpoint: any; nodeId: string }) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(
      nodeId
        ? `/target/${nodeId}/routes`
        : `/routes`
    );
  };

  const getMethodColor = (m: string) => {
    if (!m) return 'text-muted-foreground bg-muted/50';
    switch (String(m).toUpperCase()) {
        case 'GET': return 'text-emerald-600 bg-emerald-500/10';
        case 'POST': return 'text-indigo-600 bg-indigo-500/10';
        case 'PUT':
        case 'PATCH': return 'text-amber-600 bg-amber-500/10';
        case 'DELETE': return 'text-rose-600 bg-rose-500/10';
        default: return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <Card size="sm" onClick={handleEdit} className="opacity-90 hover:opacity-100">
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'border-none font-semibold uppercase',
                getMethodColor(ep.method)
              )}
            >
              {ep.method || 'UNKNOWN'}
            </Badge>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon-xs" onClick={handleEdit}>
              <Icons.external className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <TextHeading size="h6" className="lowercase truncate">
            {ep.path || ep.endpoint}
          </TextHeading>
          <p className="text-xs text-muted-foreground line-clamp-1 lowercase font-normal">
            {ep.description || 'no description'}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/5">
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] px-1.5 py-0 h-4 border-none uppercase font-semibold',
              ep.isActive 
                ? 'bg-indigo-500/10 text-indigo-600'
                : 'bg-muted/50 text-muted-foreground/60',
            )}
          >
            {ep.isActive ? 'active' : 'inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function EditSchemaMetadataForm({
  schema,
  categories,
  onClose,
}: {
  schema: DatabaseTable;
  categories: any[];
  onClose: () => void;
}) {
  const { update } = useDatabaseSchema();
  const [form, setForm] = useState({
    name: schema.name,
    description: schema.description || '',
    categoryId: schema.categoryId || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await update(schema.id, {
      name: form.name,
      description: form.description,
      category_id: form.categoryId || null,
    });
    if (success) onClose();
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
         <Field>
          <FieldLabel>display name</FieldLabel>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field>
          <FieldLabel>description</FieldLabel>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="brief description for this schema"
            className="min-h-[100px]"
          />
        </Field>
        <Field>
          <FieldLabel>category</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, categoryId: '' })}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-base transition-all',
                !form.categoryId ? 'ring-2 ring-primary bg-primary/5 border-primary/20' : 'hover:bg-muted/50 border-transparent bg-muted/20',
              )}
            >
              <Icons.layers className="size-4 opacity-40" />
              <span>uncategorized</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm({ ...form, categoryId: cat.id })}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-base transition-all',
                  form.categoryId === cat.id ? 'ring-2 ring-primary bg-primary/5 border-primary/20' : 'hover:bg-muted/50 border-transparent bg-muted/20',
                )}
                style={{ 
                  color: form.categoryId === cat.id ? cat.color : undefined,
                }}
              >
                {(() => {
                  const IconComp = (Icons as any)[cat.icon] || Icons.layers;
                  return <IconComp className="size-4 opacity-40" />;
                })()}
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
        <Button variant="ghost" onClick={onClose} type="button">
          cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          save changes
        </Button>
      </div>
    </form>
  );
}
