'use client';

import { useState } from 'react';
import { Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useToast } from '@/modules/_core';
import { useRouteBuilder } from '@/features-target/feature-dynamic-routes/components/builder/composables';
import { generateSwaggerJson } from '@/features-target/feature-dynamic-routes/components/builder/utils/swaggerGenerator';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-500',
  POST: 'bg-emerald-500/10 text-emerald-500',
  PUT: 'bg-amber-500/10 text-amber-500',
  DELETE: 'bg-rose-500/10 text-rose-500',
  PATCH: 'bg-purple-500/10 text-purple-500',
};

interface ApiExplorerViewProps {
  targetId: string;
}

export const ApiExplorerView = ({ targetId }: ApiExplorerViewProps) => {
  const { addToast } = useToast();
  const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

  const {
    loading,
    categories,
    endpoints,
    filteredEndpoints,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useRouteBuilder(targetId);

  const [activeEndpointId, setActiveEndpointId] = useState<string | null>(null);

  const handleDownloadSwagger = () => {
    const swaggerJson = generateSwaggerJson(endpoints, categories);
    const blob = new Blob([JSON.stringify(swaggerJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi-lineage.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(L.messages.swaggerExported || 'OpenAPI schema exported', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div className="flex flex-row items-center gap-4">
          <div className="size-12 rounded-2xl bg-foreground flex items-center justify-center text-background border-none">
            <Icons.code className="size-6" />
          </div>
          <div>
            <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase">
              {L.explorer?.title || 'api explorer'}
            </TextHeading>
            <p className="text-base text-muted-foreground lowercase leading-relaxed">
              {L.explorer?.subtitle || 'browse and inspect all dynamic lineage routes.'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadSwagger} className="lowercase">
          <Icons.download className="size-4 mr-2" />
          openapi
        </Button>
      </div>

      {/* Sticky Search Bar */}
      <Card className="sticky top-4 z-20 bg-muted/40 backdrop-blur-md">
        <div className="p-3 sm:p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Icons.search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="search endpoints..."
              className="pl-10 h-10 bg-background border-none rounded-xl text-base lowercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all lowercase border-none',
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background'
                    : 'bg-background text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Layout Grid */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 z-30 flex items-center justify-center rounded-3xl backdrop-blur-[1px]">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-none pr-1">
            {filteredEndpoints.map((ep, idx) => (
              <div
                key={ep.id}
                onClick={() => setActiveEndpointId(ep.id)}
                className={cn(
                  'p-4 rounded-2xl transition-all cursor-pointer border-none group animate-in slide-in-from-left-2 duration-500 fill-mode-both',
                  activeEndpointId === ep.id
                    ? 'bg-muted text-foreground'
                    : 'bg-card hover:bg-muted/40',
                )}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex flex-row gap-4 items-center">
                  <div
                    className={cn(
                      'rounded-lg text-xs h-6 flex items-center justify-center w-14 font-bold lowercase',
                      METHOD_COLORS[ep.method] || METHOD_COLORS.GET,
                    )}
                  >
                    {ep.method}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-base truncate transition-all',
                        activeEndpointId === ep.id
                          ? 'font-medium text-foreground'
                          : 'font-normal text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {ep.path}
                    </p>
                    <p className="text-sm text-muted-foreground truncate lowercase mt-0.5">
                      {ep.description || 'no description provided'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filteredEndpoints.length === 0 && !loading && (
              <div className="p-8 text-center border-none bg-muted/20 rounded-2xl">
                <p className="text-base text-muted-foreground lowercase">
                  no routes matched your query.
                </p>
              </div>
            )}
          </div>

          {/* Inspection Panel */}
          <div className="lg:col-span-2">
            {activeEndpointId ? (
              <Card className="sticky top-32 overflow-hidden bg-card transition-all">
                {(() => {
                  const ep = endpoints.find((e) => e.id === activeEndpointId);
                  if (!ep) return null;

                  return (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      <div className="p-6 pb-6 border-b border-border/5 bg-muted/40">
                        <div className="flex flex-row items-center gap-3 mb-4">
                          <div
                            className={cn(
                              'rounded-lg px-2.5 py-0.5 text-xs font-bold lowercase',
                              METHOD_COLORS[ep.method] || METHOD_COLORS.GET,
                            )}
                          >
                            {ep.method}
                          </div>
                          <TextHeading size="h5" className="text-xl font-medium">
                            {ep.path}
                          </TextHeading>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6 lowercase">
                          {ep.description ||
                            'this endpoint provides direct lineage rpc access to the target microservices.'}
                        </p>
                        <div className="flex flex-row flex-wrap gap-8 items-center">
                          <div className="flex flex-row items-center gap-2.5 text-sm font-medium text-muted-foreground lowercase">
                            <Icons.lock className="size-4.5" />
                            security{' '}
                            <span className="bg-background px-2.5 py-1 rounded-xl border-none text-foreground">
                              {ep.minRoleLevel || 0}
                            </span>
                          </div>
                          <div className="flex flex-row items-center gap-2.5 text-sm font-medium text-muted-foreground lowercase">
                            <Icons.folder className="size-4.5" />
                            group{' '}
                            <span className="bg-background px-2.5 py-1 rounded-xl border-none text-foreground">
                              {categories.find((c) => c.id === ep.categoryId)?.name.toLowerCase() ||
                                'uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-6">
                        <div>
                          <div className="flex items-center gap-2.5 mb-4 text-base font-medium text-muted-foreground lowercase">
                            <Icons.code className="size-4.5" />
                            response data schema
                          </div>
                          <div className="bg-muted/30 p-6 rounded-2xl border-none overflow-hidden relative group">
                            <pre className="text-base text-foreground leading-relaxed overflow-x-auto scrollbar-none font-normal whitespace-pre-wrap font-sans">
                              {(() => {
                                try {
                                  return JSON.stringify(
                                    JSON.parse(ep.responseData || '{}'),
                                    null,
                                    2,
                                  );
                                } catch {
                                  return ep.responseData || '{}';
                                }
                              })()}
                            </pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ep.responseData || '{}');
                                addToast('schema copied', 'success');
                              }}
                              className="absolute top-4 right-4 size-10 flex items-center justify-center bg-muted hover:bg-foreground hover:text-background rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                            >
                              <Icons.copy className="size-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-row justify-end gap-3 pt-6 border-t border-border/5">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(ep.responseData || '{}');
                              addToast('schema copied to clipboard', 'success');
                            }}
                            className="lowercase"
                          >
                            <Icons.copy className="size-4.5 mr-2" />
                            copy schema
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <Card className="h-96 flex flex-col items-center justify-center bg-muted/20 transition-all">
                <div className="size-20 bg-background rounded-[2.5rem] flex items-center justify-center mb-6 shadow-none border-none">
                  <Icons.rocket className="size-10 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-muted-foreground lowercase mb-1">
                  no endpoint selected
                </p>
                <p className="text-sm text-muted-foreground lowercase opacity-80">
                  select a route from the sidebar to inspect its architecture.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
