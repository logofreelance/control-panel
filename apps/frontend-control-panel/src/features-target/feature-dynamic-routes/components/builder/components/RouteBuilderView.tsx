'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Input, 
  Button, 
  Select, 
  Badge, 
  Popover, 
  PopoverContent, 
  PopoverTrigger,
  Modal,
  TextHeading,
  Switch
} from '@/components/ui';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { ConfirmDialog, FullPageLoading as LoadingOverlay } from '@/modules/_core';
import { cn } from '@/lib/utils';
import { useRouteBuilder } from '../composables/useRouteBuilder';

interface RouteBuilderViewProps {
  targetId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const RouteBuilderView: React.FC<RouteBuilderViewProps> = ({ targetId, onNavigate }) => {
  const {
    endpoints,
    categories,
    loading,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedMethod,
    setSelectedMethod,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    categoryForm,
    setCategoryForm,
    handleSaveCategory,
    isSavingCategory,
    openDeleteConfirm,
    executeDelete,
    deleteConfirm,
    setDeleteConfirm,
    filteredEndpoints,
    handleToggleEndpoint,
  } = useRouteBuilder(targetId);

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(10);

  React.useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedCategory, selectedMethod]);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'POST':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'PUT':
      case 'PATCH':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'DELETE':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

  return (
    <div className="space-y-8 pb-16">
      {/* Header - Flat Luxury */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex flex-col gap-1">
          <TextHeading size="h3" className="lowercase text-foreground">
            {L.title || 'route builder'}
          </TextHeading>
          <p className="text-base md:text-lg text-muted-foreground font-normal lowercase">
            {L.subtitle || 'manage dynamic api routes and data binding'}
          </p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsManageCategoriesOpen(true)}
          >
            <Icons.folder className="size-5 mr-3" />
            manage categories
          </Button>
          <Button variant="default" onClick={() => onNavigate('editor')}>
            <Icons.plus className="size-5 mr-3" />
            {L.buttons.createEndpoint || 'create endpoint'}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Premium Minimalist */}
      <div className="relative min-h-[160px]">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-3xl animate-in fade-in duration-500">
            <div className="size-8 border-2 border-border border-t-foreground animate-spin rounded-full" />
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {[
            {
              label: 'endpoints',
              value: stats.total,
              sub: 'active lineages',
              Icon: Icons.link,
              color: 'text-primary',
              bg: 'bg-muted',
            },
            {
              label: 'online',
              value: stats.active,
              sub: 'running nodes',
              Icon: Icons.checkCircle,
              color: 'text-foreground',
              bg: 'bg-muted',
            },
            {
              label: 'categories',
              value: stats.categories,
              sub: 'logic groups',
              Icon: Icons.folder,
              color: 'text-primary',
              bg: 'bg-muted',
            },
            {
              label: 'methods',
              value: stats.methods,
              sub: 'protocol types',
              Icon: Icons.branch,
              color: 'text-foreground',
              bg: 'bg-muted',
            },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-row items-start justify-between">
                  <span className="text-base text-muted-foreground font-normal lowercase">
                    {stat.label}
                  </span>
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <stat.Icon className={cn('size-5', stat.color)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-auto">
                  <span className="text-2xl sm:text-3xl font-semibold text-foreground lowercase leading-none">
                    {stat.value}
                  </span>
                  <span className="text-base md:text-lg text-muted-foreground font-normal lowercase mt-1">
                    {stat.sub}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Combined Search & Filter Bar - Flat Luxury All-in-One */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-row items-center w-full min-h-[56px] bg-muted border border-border rounded-2xl p-1.5 transition-all shadow-none gap-2">
          <div className="pl-3 flex items-center shrink-0 pointer-events-none">
            <Icons.search className="size-5 text-muted-foreground" />
          </div>

          <Input
            placeholder="search lineage endpoints..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 h-10 px-2 lowercase min-w-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-[160px]">
                <Select
                  placeholder="category"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  options={[
                    { label: 'all category', value: '' },
                    ...categories.map((c) => ({ label: c.name.toLowerCase(), value: c.id })),
                  ]}
                />
              </div>
              <div className="w-[140px]">
                <Select
                  placeholder="method"
                  value={selectedMethod || ''}
                  onChange={(e) => setSelectedMethod(e.target.value || null)}
                  options={[
                    { label: 'all methods', value: '' },
                    ...['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({
                      label: m.toLowerCase(),
                      value: m,
                    })),
                  ]}
                />
              </div>
            </div>
            <div className="sm:hidden">
              <Popover>
                <PopoverTrigger>
                  <Button variant="outline" className="h-10">
                    <Icons.plus className="size-4 rotate-45 mr-2" />
                    {'filter'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-base text-muted-foreground lowercase">
                        category filter
                      </span>
                      <div className="w-full">
                        <Select
                          placeholder="select category"
                          value={selectedCategory || ''}
                          onChange={(e) => setSelectedCategory(e.target.value || null)}
                          options={[
                            { label: 'all category', value: '' },
                            ...categories.map((c) => ({
                              label: c.name.toLowerCase(),
                              value: c.id,
                            })),
                          ]}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-base text-muted-foreground lowercase">
                        method filter
                      </span>
                      <div className="w-full">
                        <Select
                          placeholder="select method"
                          value={selectedMethod || ''}
                          onChange={(e) => setSelectedMethod(e.target.value || null)}
                          options={[
                            { label: 'all methods', value: '' },
                            ...['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({
                              label: m.toLowerCase(),
                              value: m,
                            })),
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {(searchQuery || selectedCategory || selectedMethod) && (
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-xl mr-1"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedMethod(null);
                }}
              >
                <Icons.close className="size-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="w-full flex flex-col gap-8">
        {/* Endpoints List - Full Width */}
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border/10 pb-4">
            <TextHeading size="h4" className="lowercase text-foreground">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()
                : L.labels.allEndpoints || 'all endpoints'}
            </TextHeading>
            <span className="text-base text-muted-foreground font-normal lowercase">
              showing {filteredEndpoints.length} of {endpoints.length} endpoints
            </span>
          </div>

          {filteredEndpoints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center text-center py-16">
                <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Icons.link className="size-10 text-muted-foreground" />
                </div>
                <TextHeading size="h4" className="lowercase text-muted-foreground mb-2">
                  no endpoints found
                </TextHeading>
                <p className="text-base md:text-lg text-muted-foreground font-normal lowercase">
                  try adjusting your search or category filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredEndpoints.slice(0, visibleCount).map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="group relative flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-border bg-card hover:border-primary/20 cursor-pointer transition-all"
                  onClick={() => onNavigate('detail', endpoint.id)}
                >
                  <div className="flex flex-row items-center gap-2 sm:gap-4 min-w-0 pr-1 sm:pr-2">
                    <div
                      className={cn(
                        'w-12 sm:w-14 h-6 rounded-md flex items-center justify-center shrink-0 transition-all',
                        getMethodColor(endpoint.method)
                      )}
                    >
                      <span className="text-[10px] sm:text-xs font-medium">{endpoint.method}</span>
                    </div>

                    <div className="flex flex-col justify-center min-w-0 py-0.5">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-sm sm:text-base md:text-[17px] font-medium lowercase text-foreground truncate leading-none mt-0.5">
                          {endpoint.path}
                        </span>
                        {!endpoint.isActive && (
                          <Badge variant="destructive" className="h-4 sm:h-5 px-1.5 text-[9px] sm:text-[11px] rounded-sm hidden sm:inline-flex leading-none">disabled</Badge>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground lowercase truncate leading-none">
                          {categories.find(c => c.id === endpoint.categoryId)?.name || 'uncategorized'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center mr-1 sm:mr-2 scale-[0.8] sm:scale-100 origin-right">
                      <Switch
                        checked={endpoint.isActive}
                        onCheckedChange={() => handleToggleEndpoint(endpoint.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 sm:size-8 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('editor', endpoint.id);
                      }}
                    >
                      <Icons.edit className="size-3.5 sm:size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 sm:size-8 rounded-md hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm('endpoint', endpoint.id, endpoint.path);
                      }}
                    >
                      <Icons.trash className="size-3.5 sm:size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {visibleCount < filteredEndpoints.length && (
                <div className="flex justify-center mt-4 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    show more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS SECTION */}

      {/* Manage Categories Modal */}
      <Modal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        className="sm:max-w-lg p-0 overflow-hidden"
      >
        <div className="flex flex-col">
          <div className="px-6 py-6 flex items-center justify-between border-b border-border/10 bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icons.folder className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-foreground lowercase leading-none mb-1">
                  manage categories
                </span>
                <span className="text-sm text-muted-foreground lowercase">
                  {categories.length} logic groups
                </span>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: '', description: '' });
                setIsCategoryModalOpen(true);
              }}
            >
              <Icons.plus className="size-4 mr-2" />
              add new
            </Button>
          </div>

          <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
            {categories.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground text-sm lowercase">no categories found. create one above.</div>
            ) : (
              categories.map(category => {
                const count = endpoints.filter((e) => e.categoryId === category.id).length;
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/20 transition-all">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                      <span className="text-base font-medium lowercase text-foreground truncate">{category.name}</span>
                      <span className="text-xs text-muted-foreground lowercase">{count} routes</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md"
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({
                            name: category.name,
                            description: category.description || '',
                          });
                          setIsCategoryModalOpen(true);
                        }}
                      >
                        <Icons.edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md hover:text-destructive"
                        onClick={() => {
                          openDeleteConfirm('category', category.id, category.name);
                        }}
                      >
                        <Icons.trash className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Category Modal (Create/Edit Form) */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        className="sm:max-w-lg p-0 overflow-hidden"
      >
        <div className="flex flex-col">
          {/* Custom Header Banner */}
          <div className="px-8 py-8 flex items-center gap-5">
            <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Icons.folder className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-normal text-foreground lowercase leading-none mb-1.5">
                {editingCategory
                  ? L.buttons.edit.toLowerCase()
                  : L.buttons.newCategory.toLowerCase()}
              </span>
              <p className="text-base md:text-lg text-muted-foreground font-normal lowercase">
                group your API routes into logical categories
              </p>
            </div>
          </div>

          <div className="px-8 pb-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground lowercase ml-1">
                  category name
                </label>
                <Input
                  className="text-base"
                  placeholder={L.placeholders.categoryName.toLowerCase()}
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground lowercase ml-1">description</label>
                <Input
                  className="text-base"
                  placeholder={L.placeholders.categoryDescription.toLowerCase()}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-4 pt-2">
              <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>
                {L.buttons.cancel}
              </Button>
              <Button variant="default" onClick={handleSaveCategory} disabled={isSavingCategory}>
                {isSavingCategory ? 'saving...' : L.buttons.save}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Global Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title={
            deleteConfirm.type === 'category'
              ? L.messages.confirmDeleteCategory
              : L.messages.confirmDeleteEndpoint
          }
          message={`are you sure you want to delete ${deleteConfirm.name}? this action cannot be undone.`}
          onConfirm={executeDelete}
          variant="danger"
          confirmText="delete"
          cancelText="cancel"
        />
      )}
    </div>
  );
};
