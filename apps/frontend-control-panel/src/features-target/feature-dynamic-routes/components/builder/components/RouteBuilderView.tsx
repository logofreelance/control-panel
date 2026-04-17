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
  TextHeading
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
  } = useRouteBuilder(targetId);

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
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', description: '' });
              setIsCategoryModalOpen(true);
            }}
          >
            <Icons.plus className="size-5 mr-3" />
            {L.buttons.newCategory || 'add category'}
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
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative flex items-center w-full min-h-[56px] bg-muted border border-border rounded-2xl p-1 transition-all overflow-hidden shadow-none">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icons.search className="size-5 text-muted-foreground" />
          </div>

          <Input
            placeholder="search lineage endpoints..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 h-12 pl-12 pr-40 sm:pr-80 lowercase"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="absolute right-1 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-36">
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
              <div className="w-28">
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
                  <Button variant="outline">
                    <Icons.plus className="size-5 rotate-45 mr-3" />
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
                variant="outline"
                size="icon"
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Categories Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <TextHeading size="h4" className="lowercase text-foreground">
              {L.labels.categories || 'categories'}
            </TextHeading>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'group relative w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 lowercase text-base md:text-lg font-normal text-left shadow-none',
                !selectedCategory
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/20',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center transition-all',
                    !selectedCategory
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground group-hover:bg-muted/30',
                  )}
                >
                  <span className="text-base font-normal">{endpoints.length}</span>
                </div>
                <span>{L.labels.allRoutes || 'all routes'}</span>
              </div>
              {!selectedCategory && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground rounded-r-full" />
              )}
            </button>

            {categories.map((category) => {
              const count = endpoints.filter((e) => e.categoryId === category.id).length;
              return (
                <div key={category.id} className="group relative">
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 lowercase text-base md:text-lg font-normal text-left pr-20 shadow-none',
                      selectedCategory === category.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/5',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-10 rounded-xl flex items-center justify-center transition-all',
                          selectedCategory === category.id
                            ? 'bg-background text-foreground scale-105'
                            : 'bg-muted/5 text-muted-foreground group-hover:bg-muted/10',
                        )}
                      >
                        <span className="text-base font-normal">{count}</span>
                      </div>
                      <span className="truncate">{category.name}</span>
                    </div>
                    {selectedCategory === category.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground rounded-r-full" />
                    )}
                  </button>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(category);
                        setCategoryForm({
                          name: category.name,
                          description: category.description || '',
                        });
                        setIsCategoryModalOpen(true);
                      }}
                    >
                      <Icons.edit className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm('category', category.id, category.name);
                      }}
                    >
                      <Icons.trash className="size-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Endpoints List */}
        <div className="md:col-span-8 space-y-8">
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
            <div className="grid grid-cols-1 gap-6">
              {filteredEndpoints.map((endpoint) => (
                <Card
                  key={endpoint.id}
                  className="group cursor-pointer"
                  onClick={() => onNavigate('detail', endpoint.id)}
                >
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-row items-center gap-4">
                        <div
                          className={cn(
                            'w-14 h-7 rounded-lg flex items-center justify-center shrink-0 border-none transition-all',
                            endpoint.method === 'GET'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <span className="text-sm font-normal">{endpoint.method}</span>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <TextHeading size="h5" className="lowercase text-foreground">
                              {endpoint.path}
                            </TextHeading>
                            {!endpoint.isActive && (
                              <div className="flex">
                                <Badge variant="destructive">disabled</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('detail', endpoint.id);
                          }}
                        >
                          <Icons.edit className="size-5 mr-3" />
                          {L.buttons.edit || 'manage'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm('endpoint', endpoint.id, endpoint.path);
                          }}
                        >
                          <Icons.trash className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS SECTION */}

      {/* Category Modal */}
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
