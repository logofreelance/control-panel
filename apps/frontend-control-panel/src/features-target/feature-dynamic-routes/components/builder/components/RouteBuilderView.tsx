'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    <div className="space-y-12 pb-20 animate-page-enter">
      {/* Header - Flat Luxury */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <TextHeading as="h1" size="h3" className="lowercase text-foreground">
            {L.title || 'route builder'}
          </TextHeading>
          <span className="text-sm md:text-lg text-muted-foreground font-normal lowercase">
            {L.subtitle || 'manage dynamic api routes and data binding'}
          </span>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', description: '' });
              setIsCategoryModalOpen(true);
            }}
            className="rounded-xl lowercase font-medium"
          >
            <Icons.plus className="size-4" />
            {L.buttons.newCategory || 'add category'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onNavigate('editor')}
            className="rounded-xl lowercase font-medium"
          >
            <Icons.plus className="size-4" />
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
              color: 'text-chart-1',
              bg: 'bg-chart-1/10',
            },
            {
              label: 'online',
              value: stats.active,
              sub: 'running nodes',
              Icon: Icons.checkCircle,
              color: 'text-chart-2',
              bg: 'bg-chart-2/10',
            },
            {
              label: 'categories',
              value: stats.categories,
              sub: 'logic groups',
              Icon: Icons.folder,
              color: 'text-chart-3',
              bg: 'bg-chart-3/10',
            },
            {
              label: 'methods',
              value: stats.methods,
              sub: 'protocol types',
              Icon: Icons.branch,
              color: 'text-chart-4',
              bg: 'bg-chart-4/10',
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-card rounded-2xl border-none shadow-none p-6 transition-all duration-300 hover:bg-muted/5 flex flex-col gap-5"
            >
              <div className="flex flex-row items-start justify-between">
                <span className="text-sm text-muted-foreground font-normal lowercase">
                  {stat.label}
                </span>
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center shrink-0',
                    stat.bg,
                  )}
                >
                  <stat.Icon className={cn('size-4', stat.color)} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-auto">
                <span className="text-3xl sm:text-4xl font-bold text-foreground lowercase leading-none">
                  {stat.value}
                </span>
                <span className="text-base text-muted-foreground font-normal lowercase mt-1">
                  {stat.sub}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Combined Search & Filter Bar - Flat Luxury All-in-One */}
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative flex items-center w-full min-h-[48px] bg-muted border border-border rounded-2xl p-1 focus-within:border-foreground/20 transition-all overflow-hidden shadow-none">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icons.search className="size-4 text-muted-foreground" />
          </div>

          <Input
            placeholder="search lineage endpoints..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 h-10 pl-11 pr-40 sm:pr-80 text-sm placeholder:text-muted-foreground text-foreground lowercase font-normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="absolute right-1 flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-2">
              <Select
                placeholder="category"
                size="sm"
                className="h-9 px-3 rounded-xl bg-background border border-border text-sm lowercase font-normal w-36 shadow-none"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                options={[
                  { label: 'all category', value: '' },
                  ...categories.map((c) => ({ label: c.name.toLowerCase(), value: c.id })),
                ]}
              />
              <Select
                placeholder="method"
                size="sm"
                className="h-9 px-3 rounded-xl bg-background border border-border text-sm lowercase font-normal w-28 shadow-none"
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
            <div className="sm:hidden">
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 rounded-xl bg-background border border-border text-sm lowercase font-normal gap-1.5"
                  >
                    <Icons.plus className="size-3.5 rotate-45" />
                    <span>filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl flex flex-col gap-3 shadow-2xl border border-border">
                  <div className="space-y-1.5 text-sm text-muted-foreground lowercase">
                    <span>category filter</span>
                    <Select
                      placeholder="select category"
                      size="sm"
                      className="h-10 px-3 rounded-xl bg-muted/20 border-none text-sm lowercase font-normal w-full shadow-none"
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      options={[
                        { label: 'all category', value: '' },
                        ...categories.map((c) => ({ label: c.name.toLowerCase(), value: c.id })),
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground lowercase">
                    <span>method filter</span>
                    <Select
                      placeholder="select method"
                      size="sm"
                      className="h-10 px-3 rounded-xl bg-muted/20 border-none text-sm lowercase font-normal w-full shadow-none"
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
                </PopoverContent>
              </Popover>
            </div>
            {(searchQuery || selectedCategory || selectedMethod) && (
              <Button
                variant="ghost"
                className="size-9 p-0 rounded-xl bg-background hover:bg-muted/10 shrink-0 text-muted-foreground hover:text-foreground transition-all border border-border"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedMethod(null);
                }}
              >
                <Icons.close className="size-4" />
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
            <TextHeading as="h4" size="h4" className="lowercase text-foreground">
              {L.labels.categories || 'categories'}
            </TextHeading>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'group relative w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 lowercase text-base sm:text-lg font-normal text-left shadow-none',
                !selectedCategory
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/5',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'size-8 rounded-xl flex items-center justify-center transition-all',
                    !selectedCategory
                      ? 'bg-foreground text-background scale-105'
                      : 'bg-muted text-muted-foreground group-hover:bg-muted/20',
                  )}
                >
                  <span className="text-sm font-bold">{endpoints.length}</span>
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
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 lowercase text-base sm:text-lg font-normal text-left pr-20 shadow-none',
                      selectedCategory === category.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/5',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-8 rounded-xl flex items-center justify-center transition-all',
                          selectedCategory === category.id
                            ? 'bg-background text-foreground scale-105'
                            : 'bg-muted/5 text-muted-foreground group-hover:bg-muted/10',
                        )}
                      >
                        <span className="text-sm font-bold">{count}</span>
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
                      size="sm"
                      className={cn(
                        'size-10 p-0 rounded-xl hover:bg-muted/20',
                        selectedCategory === category.id
                          ? 'text-foreground hover:text-foreground'
                          : 'text-muted-foreground',
                      )}
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
                      <Icons.edit className="size-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'size-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive',
                        selectedCategory === category.id
                          ? 'text-foreground hover:text-destructive'
                          : 'text-muted-foreground',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm('category', category.id, category.name);
                      }}
                    >
                      <Icons.trash className="size-4" strokeWidth={1.5} />
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
            <TextHeading as="h4" size="h4" className="lowercase text-foreground">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()
                : L.labels.allEndpoints || 'all endpoints'}
            </TextHeading>
            <span className="text-sm text-muted-foreground font-normal lowercase">
              showing {filteredEndpoints.length} of {endpoints.length} endpoints
            </span>
          </div>

          {filteredEndpoints.length === 0 ? (
            <Card className="rounded-3xl border-2 border-dashed border-border bg-transparent p-20 flex flex-col items-center justify-center text-center shadow-none">
              <div className="size-20 rounded-full bg-muted/5 flex items-center justify-center mb-6">
                <Icons.link className="size-10 text-muted-foreground" />
              </div>
              <TextHeading as="h3" size="h4" className="lowercase text-muted-foreground mb-2">
                no endpoints found
              </TextHeading>
              <p className="text-sm text-muted-foreground lowercase">
                try adjusting your search or category filters
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredEndpoints.map((endpoint) => (
                <Card
                  key={endpoint.id}
                  className="p-5 rounded-2xl border-none bg-card shadow-none hover:bg-muted/10 transition-all duration-300 group cursor-pointer"
                  onClick={() => onNavigate('detail', endpoint.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-row items-center gap-4">
                      <div
                        className={cn(
                          'w-14 py-1.5 rounded-lg flex items-center justify-center shrink-0 border-none transition-all',
                          endpoint.method === 'GET'
                            ? 'bg-blue-500/10 text-blue-500'
                            : endpoint.method === 'POST'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : endpoint.method === 'PUT'
                                ? 'bg-amber-500/10 text-amber-500'
                                : endpoint.method === 'DELETE'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : 'bg-purple-500/10 text-purple-500',
                        )}
                      >
                        <span className="text-[10px] font-bold uppercase">
                          {endpoint.method}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <TextHeading
                            as="h3"
                            size="h4"
                            className="lowercase text-foreground text-base sm:text-lg font-medium"
                          >
                            {endpoint.path}
                          </TextHeading>
                          {!endpoint.isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-[10px] text-destructive lowercase font-medium">
                              disabled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 h-10 px-4 rounded-xl hover:bg-muted/10 text-muted-foreground transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('detail', endpoint.id);
                        }}
                      >
                        <Icons.edit className="size-4" />
                        <span className="text-sm font-normal lowercase">
                          {L.buttons.edit || 'manage'}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm('endpoint', endpoint.id, endpoint.path);
                        }}
                      >
                        <Icons.trash className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS SECTION */}

      {/* Category Modal (Inline Implementation) */}
      <Popover
        open={isCategoryModalOpen}
        onOpenChange={(open: boolean) => setIsCategoryModalOpen(open)}
      >
        <PopoverContent className="w-[400px] p-8 rounded-4xl shadow-2xl border-border/10">
          <div className="space-y-6">
            <TextHeading size="h4" className="lowercase">
              {editingCategory ? L.buttons.edit : L.buttons.newCategory}
            </TextHeading>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground/40 lowercase ml-1">name</span>
                <Input
                  placeholder={L.placeholders.categoryName}
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="rounded-xl h-11 bg-muted/5 border-border/40 lowercase"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground/40 lowercase ml-1">description</span>
                <Input
                  placeholder={L.placeholders.categoryDescription}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="rounded-xl h-11 bg-muted/5 border-border/40 lowercase"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCategoryModalOpen(false)}
                className="lowercase rounded-xl h-10 px-6"
              >
                {L.buttons.cancel}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveCategory}
                disabled={isSavingCategory}
                className="lowercase rounded-xl h-10 px-8 shadow-none"
              >
                {isSavingCategory ? 'saving...' : L.buttons.save}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

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
