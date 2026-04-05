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
    GET: 'bg-blue-500/10 text-blue-600',
    POST: 'bg-emerald-500/10 text-emerald-600',
    PUT: 'bg-amber-500/10 text-amber-600',
    DELETE: 'bg-red-500/10 text-red-600',
    PATCH: 'bg-purple-500/10 text-purple-600',
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
        setSelectedCategory
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-row items-center gap-4">
                    <div className="size-12 rounded-2xl bg-foreground flex items-center justify-center text-background shadow-none border-none">
                        <Icons.code className="size-6" />
                    </div>
                    <div>
                        <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase tracking-tight">
                            {L.explorer?.title || "api explorer"}
                        </TextHeading>
                        <p className="text-sm text-muted-foreground/60 lowercase leading-relaxed">
                            {L.explorer?.subtitle || "browse and inspect all dynamic lineage routes."}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadSwagger} className="rounded-xl lowercase h-10 px-5 text-xs font-semibold gap-2 border-2 hover:bg-muted/10">
                    <Icons.download className="size-4" />
                    OpenAPI
                </Button>
            </div>

            {/* Sticky Search Bar */}
            <Card className="sticky top-4 z-20 rounded-3xl border-2 border-foreground/5 bg-muted/20 shadow-none backdrop-blur-md">
                <div className="p-3 sm:p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Icons.search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                        <Input
                            placeholder="search endpoints..."
                            className="pl-9 h-10 bg-background border-border/20 rounded-xl text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold transition-all lowercase tracking-wide border-2",
                                    selectedCategory === cat.id
                                        ? 'bg-foreground text-background border-foreground shadow-none'
                                        : 'bg-background text-muted-foreground/40 border-border/5 hover:border-foreground/10 hover:text-foreground'
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-none pr-1">
                        {filteredEndpoints.map((ep, idx) => (
                            <div
                                key={ep.id}
                                onClick={() => setActiveEndpointId(ep.id)}
                                className={cn(
                                    "p-4 rounded-2xl transition-all cursor-pointer border-2 group animate-in slide-in-from-left-2 duration-500 fill-mode-both",
                                    activeEndpointId === ep.id
                                        ? 'bg-muted/80 border-foreground/5 shadow-none'
                                        : 'bg-card border-transparent hover:bg-muted/30 hover:border-foreground/5'
                                )}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div className="flex flex-row gap-4 items-center">
                                    <Badge className={cn("rounded-lg text-[9px] w-14 text-center font-bold tracking-wider", METHOD_COLORS[ep.method] || METHOD_COLORS.GET)}>
                                        {ep.method}
                                    </Badge>
                                    <div className="min-w-0 flex-1">
                                        <p className={cn("font-mono text-xs truncate transition-all tracking-tight", activeEndpointId === ep.id ? 'font-bold text-foreground' : 'font-medium text-muted-foreground/80 group-hover:text-foreground/80')}>
                                            {ep.path}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/30 truncate lowercase mt-0.5">
                                            {ep.description || "no description provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredEndpoints.length === 0 && !loading && (
                            <div className="p-8 text-center border-2 border-dashed border-border/10 rounded-2xl">
                                <p className="text-xs text-muted-foreground/30 lowercase">no routes matched your query.</p>
                            </div>
                        )}
                    </div>

                    {/* Inspection Panel */}
                    <div className="lg:col-span-2">
                        {activeEndpointId ? (
                            <Card className="sticky top-32 rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden bg-card transition-all">
                                {(() => {
                                    const ep = endpoints.find(e => e.id === activeEndpointId);
                                    if (!ep) return null;

                                    return (
                                        <div className="animate-in fade-in zoom-in-95 duration-500">
                                            <div className="p-6 sm:p-8 border-b border-border/10 bg-muted/20">
                                                <div className="flex flex-row items-center gap-3 mb-4">
                                                    <Badge className={cn("rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", METHOD_COLORS[ep.method] || METHOD_COLORS.GET)}>
                                                        {ep.method}
                                                    </Badge>
                                                    <TextHeading size="h6" className="font-mono text-sm sm:text-base font-bold tracking-tight">{ep.path}</TextHeading>
                                                </div>
                                                <p className="text-sm text-muted-foreground/60 leading-relaxed mb-6 lowercase">
                                                    {ep.description || "this endpoint provides direct lineage rpc access to the target microservices."}
                                                </p>
                                                <div className="flex flex-row flex-wrap gap-6 items-center">
                                                    <div className="flex flex-row items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/30">
                                                        <Icons.lock className="size-3.5" />
                                                        security <span className="bg-background px-2 py-0.5 rounded-lg border border-border/5 text-foreground/60">{ep.minRoleLevel || 0}</span>
                                                    </div>
                                                    <div className="flex flex-row items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/30">
                                                        <Icons.folder className="size-3.5" />
                                                        group <span className="bg-background px-2 py-0.5 rounded-lg border border-border/5 text-foreground/60">{categories.find(c => c.id === ep.categoryId)?.name || 'uncategorized'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <CardContent className="p-6 sm:p-8 space-y-8">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
                                                        <Icons.code className="size-3.5" />
                                                        response data schema
                                                    </div>
                                                    <div className="bg-background p-6 rounded-2xl border-2 border-border/10 overflow-hidden relative group">
                                                        <pre className="text-[11px] font-mono text-foreground/70 leading-relaxed overflow-x-auto scrollbar-none">
                                                            {(() => {
                                                                try {
                                                                    return JSON.stringify(JSON.parse(ep.responseData || '{}'), null, 2);
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
                                                            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-muted/80 hover:bg-foreground hover:text-background rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                                        >
                                                            <Icons.copy className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row justify-end gap-3 pt-6 border-t border-border/10">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(ep.responseData || '{}');
                                                            addToast('schema copied to clipboard', 'success');
                                                        }}
                                                        className="rounded-xl h-10 px-5 text-sm lowercase transition-all hover:bg-muted/30"
                                                    >
                                                        <Icons.copy className="size-4 mr-2" />
                                                        copy schema
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </div>
                                    );
                                })()}
                            </Card>
                        ) : (
                            <Card className="h-96 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-foreground/5 shadow-none bg-muted/5 transition-all">
                                <div className="size-16 bg-background rounded-[2rem] flex items-center justify-center mb-6 shadow-none border-2 border-border/10">
                                    <Icons.rocket className="size-8 text-muted-foreground/20" />
                                </div>
                                <p className="text-sm font-semibold text-muted-foreground/60 lowercase mb-1">no endpoint selected</p>
                                <p className="text-xs text-muted-foreground/20 lowercase">select a route from the sidebar to inspect its architecture.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
