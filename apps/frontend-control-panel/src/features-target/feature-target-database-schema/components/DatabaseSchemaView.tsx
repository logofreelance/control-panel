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
  Modal,
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination on search or category change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

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
      <div className="flex flex-col gap-6 animate-page-enter">
        {/* Header & Stats */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
            <TextHeading as="h1" size="h3" weight="normal">
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
              <span className="text-sm font-medium text-primary lowercase tracking-tight">
                {L.buttons.createSchema}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Main List Section - Grouped by Category */}
        <div className="space-y-6 px-1 pb-10">
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 bg-muted/10 rounded-[2.5rem] border border-border/5">
              <div className="size-20 rounded-3xl bg-background border border-border flex items-center justify-center mb-6 shadow-xs">
                <Icons.folderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <TextHeading size="h5" weight="normal" className="mb-2 text-foreground font-medium">
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
            <div className="space-y-10">
              {/* SEARCH & FILTERS - STICKY */}
              <div className="flex flex-col md:flex-row gap-4 sticky top-[80px] z-20 bg-background/95 backdrop-blur-md py-4 border-b border-border/5 -mx-1 px-1">
                <div className="relative flex-1 group">
                    <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input 
                      placeholder="search schemas or tables..." 
                      className="pl-12 h-12 bg-muted/10 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all lowercase"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 scroll-smooth">
                    <Button 
                      variant={activeCategory === 'all' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setActiveCategory('all')}
                      className={cn(
                        "rounded-full px-5 h-10 transition-all lowercase border-none",
                        activeCategory === 'all' ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/30 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      all schemas
                    </Button>
                    <Button 
                      variant={activeCategory === 'uncategorized' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setActiveCategory('uncategorized')}
                      className={cn(
                        "rounded-full px-5 h-10 transition-all lowercase border-none",
                        activeCategory === 'uncategorized' ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/30 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      uncategorized
                    </Button>
                    {categories.map(cat => (
                      <Button 
                        key={cat.id}
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveCategory(String(cat.id))}
                        className={cn(
                          "rounded-full px-5 h-10 lowercase transition-all whitespace-nowrap border-none",
                          activeCategory === String(cat.id) ? "text-white shadow-sm" : "bg-muted/30 text-muted-foreground hover:bg-muted"
                        )}
                        style={{ 
                          backgroundColor: activeCategory === String(cat.id) ? cat.color : undefined,
                        }}
                      >
                        {cat.name}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Grouped Items with Filtering */}
              {(() => {
                const filteredSources = sources.filter(src => {
                  const matchesSearch = src.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        src.tableName.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = activeCategory === 'all' || 
                                          (activeCategory === 'uncategorized' && !src.categoryId) ||
                                          String(src.categoryId) === activeCategory;
                  return matchesSearch && matchesCategory;
                });

                const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
                const paginatedSources = filteredSources.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                );

                if (filteredSources.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5 rounded-[2.5rem] border border-dashed border-border/20">
                      <div className="size-16 rounded-3xl bg-background border border-border flex items-center justify-center mb-4 opacity-50">
                        <Icons.search className="size-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-muted-foreground lowercase max-w-xs">
                        no schemas found matching your current search and filters.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      {paginatedSources.map((src: any) => (
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

                    {/* PAGINATION UI */}
                    {totalPages > 1 && (
                      <div className="pt-6 pb-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="lowercase"
                              >
                                <Icons.chevronLeft className="size-4 mr-2" />
                                previous
                              </Button>
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <PaginationItem key={page}>
                                <Button
                                  variant={currentPage === page ? "default" : "ghost"}
                                  size="sm"
                                  className="w-10 h-10 rounded-xl lowercase"
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="lowercase"
                              >
                                next
                                <Icons.chevronRight className="size-4 ml-2" />
                              </Button>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
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
    <Card className="shadow-none border border-border/30">
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Icon className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-3xl font-medium tracking-tight text-foreground">{value}</div>
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
    <Card 
      size="sm" 
      className={cn(
        "transition-all duration-200 border border-border/30 bg-muted/5 hover:bg-background shadow-none overflow-hidden",
        isExpanded ? "ring-1 ring-primary/20 bg-background scale-[1.002] z-10 my-2" : "hover:border-border/60"
      )}
    >
      <CardContent
        className="flex flex-col md:flex-row md:items-center gap-4 cursor-pointer py-1.5"
        onClick={onToggleExpand}
      >
        {/* Visual ID & Icon */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={cn(
              'size-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 border border-transparent shadow-xs',
              isExpanded
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground',
            )}
            style={{ 
              backgroundColor: !isExpanded && source.categoryColor ? `${source.categoryColor}15` : undefined,
              color: !isExpanded && source.categoryColor ? source.categoryColor : undefined,
              borderColor: !isExpanded && source.categoryColor ? `${source.categoryColor}20` : undefined,
            }}
          >
            {(() => {
              const IconComp = (Icons as any)[source.categoryIcon] || Icons.database;
              return <IconComp className="w-5 h-5" />;
            })()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <TextHeading size="h6" weight="normal" className="lowercase font-medium truncate text-foreground">
                {source.name}
              </TextHeading>
              {source.isSystem && <Badge variant="secondary" className="text-[12px] h-4.5 px-1.5 bg-muted/50 border-none font-medium">SYSTEM</Badge>}
              {source.categoryName && (
                <Badge 
                  variant="outline" 
                  className="lowercase text-[12px] font-medium border-none h-4.5 px-2"
                  style={{ color: source.categoryColor, backgroundColor: `${source.categoryColor}15` }}
                >
                  {source.categoryName}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground lowercase font-normal">
              <span className="font-mono text-[12px] text-primary/80 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/5">
                {source.tableName}
              </span>
              <span className="opacity-30">•</span>
              <span className="font-medium text-foreground/40">
                {source.rowCount || 0} {L.labels.records.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end md:ml-auto">
          <div className="flex items-center gap-1.5 mr-2 pr-4 border-r border-border/5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEditMetadata();
              }}
              title="edit metadata"
            >
              <Icons.settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
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
              size="icon-xs"
              className="size-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={L.buttons.deleteSchema}
            >
              <Icons.trash className="w-4 h-4" />
            </Button>
          </div>
          
          <div className={cn(
            "size-10 rounded-2xl flex items-center justify-center transition-all duration-300",
            isExpanded ? "rotate-180 bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground hover:bg-muted"
          )}>
            <Icons.chevronDown className="size-5" />
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
    <div className="p-4 md:p-8 bg-muted/5 space-y-12 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              <TextHeading size="h6" weight="normal" className="lowercase">
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
    <Card size="sm" className="bg-background border border-border/30 shadow-none hover:bg-muted/5 transition-all cursor-pointer group" onClick={action}>
      <CardContent className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <TextHeading size="h6" weight="normal" className="lowercase mb-0.5 font-medium">
              {title}
            </TextHeading>
            <p className="text-sm text-muted-foreground line-clamp-1 lowercase font-normal">
              {desc}
            </p>
          </div>
        </div>
        <div className="size-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ActionIcon className="w-4 h-4" />
        </div>
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
    <Card size="sm" className="group border border-border/30 bg-background shadow-none hover:bg-muted/5 transition-all">
      <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
        {/* Info & Status */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className="text-[11px] px-2 py-0.5 h-5 border-none font-bold text-emerald-600 bg-emerald-500/10 min-w-12 flex justify-center rounded-lg"
            >
              GET
            </Badge>
            {hasJoins && (
                <div
                    className="size-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center"
                    title={L.labels.hasJoins}
                >
                    <Icons.link className="w-3.5 h-3.5" />
                </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <TextHeading size="h6" weight="normal" className="lowercase font-medium truncate text-foreground/80">
                {r.name}
              </TextHeading>
              <div className="font-mono text-[12px] text-muted-foreground/30 lowercase">
                /{r.slug}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <Badge
                variant="outline"
                className={cn(
                  'text-sm px-2 py-0 h-5 border-none uppercase font-medium rounded-lg',
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
                  className="text-sm px-2 py-0 h-5 bg-primary/5 text-primary border-none uppercase font-medium rounded-lg"
                >
                  {L.labels.filters}
                </Badge>
              )}

              <Badge
                variant="outline"
                className={cn(
                  'text-sm px-2 py-0 h-5 border-none uppercase font-medium rounded-lg',
                  r.isActive || r.is_active
                    ? 'bg-indigo-500/10 text-indigo-600'
                    : 'bg-muted/30 text-muted-foreground/60',
                )}
              >
                {r.isActive || r.is_active ? L.labels.active : L.labels.draft}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 md:border-l border-border/5 md:pl-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-4 text-[13px] font-bold lowercase bg-muted/10 border-none hover:bg-primary hover:text-primary-foreground transition-all rounded-xl"
            onClick={handleEdit}
          >
            <Icons.edit className="w-3.5 h-3.5 mr-2" />
            edit logic
          </Button>
          
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-9 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icons.trash className="w-4 h-4" />
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
          <TextHeading size="h6" weight="normal" className="lowercase">
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
    <Card size="sm" onClick={handleEdit} className="bg-background border border-border/30 shadow-none hover:bg-muted/5 transition-all cursor-pointer group">
      <CardContent className="py-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'border-none font-bold uppercase text-[11px] px-2 py-0.5 h-5 rounded-lg',
                getMethodColor(ep.method)
              )}
            >
              {ep.method || 'UNKNOWN'}
            </Badge>
          </div>

          <div className="size-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <Icons.external className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mb-4 space-y-1.5">
          <TextHeading size="h6" weight="normal" className="lowercase font-medium truncate text-foreground/80">
            {ep.path || ep.endpoint}
          </TextHeading>
          <p className="text-sm text-muted-foreground line-clamp-1 lowercase font-normal">
            {ep.description || 'no description'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/5">
          <Badge
            variant="outline"
            className={cn(
              'text-sm px-2 py-0 h-5 border-none uppercase font-medium rounded-lg',
              ep.isActive 
                ? 'bg-indigo-500/10 text-indigo-600'
                : 'bg-muted/30 text-muted-foreground/60',
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
