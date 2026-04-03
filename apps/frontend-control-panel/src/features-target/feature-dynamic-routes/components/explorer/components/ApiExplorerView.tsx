'use client';

import { useState } from 'react';
import { Button, Input, Card, CardContent, Heading, Text, Stack, Badge } from '@/components/ui';
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
        a.download = 'swagger.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(L.messages.swaggerExported || 'Swagger exported successfully', 'success');
    };

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <Stack direction="row" justify="between" align="start" className="flex-col sm:flex-row sm:items-center gap-4">
                <Stack direction="row" gap={3} align="center">
                    <div className="size-10 rounded-xl bg-foreground flex items-center justify-center text-background">
                        <Icons.code className="size-5" />
                    </div>
                    <div>
                        <Heading level={3}>{L.explorer?.title}</Heading>
                        <Text variant="muted">{L.explorer?.subtitle}</Text>
                    </div>
                </Stack>
                <Button variant="outline" size="sm" onClick={handleDownloadSwagger}>
                    <Icons.download className="size-4 mr-2" />
                    OpenAPI
                </Button>
            </Stack>

            {/* Search Bar */}
            <Card  className="sticky top-4 z-20">
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Icons.search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={L.placeholders.searchEndpoints || "Search..."}
                            className="pl-9 bg-muted border-none text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Stack direction="row" gap={2} wrap className="w-full sm:w-auto">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                                    selectedCategory === cat.id
                                        ? 'bg-foreground text-background'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </Stack>
                </div>
            </Card>

            {/* Endpoints List */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-3xl">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Navigation List */}
                    <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-slim pr-2">
                        {filteredEndpoints.map(ep => (
                            <div
                                key={ep.id}
                                onClick={() => setActiveEndpointId(ep.id)}
                                className={cn(
                                    "p-3 rounded-xl transition-colors cursor-pointer border",
                                    activeEndpointId === ep.id
                                        ? 'bg-muted border-border'
                                        : 'bg-card border-transparent hover:bg-muted/50 hover:border-border/50'
                                )}
                            >
                                <Stack direction="row" gap={3} align="center">
                                    <Badge className={cn("rounded-md text-[10px] w-12 text-center", METHOD_COLORS[ep.method] || METHOD_COLORS.GET)}>
                                        {ep.method}
                                    </Badge>
                                    <div className="min-w-0">
                                        <Text className={cn("font-mono text-xs truncate", activeEndpointId === ep.id ? 'font-semibold' : 'font-medium')}>
                                            {ep.path}
                                        </Text>
                                        <Text variant="muted" className="text-[10px] truncate">{ep.description || L.messages?.noDescription}</Text>
                                    </div>
                                </Stack>
                            </div>
                        ))}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-2">
                        {activeEndpointId ? (
                            <Card  className="sticky top-24">
                                {(() => {
                                    const ep = endpoints.find(e => e.id === activeEndpointId);
                                    if (!ep) return null;

                                    return (
                                        <>
                                            <div className="p-5 border-b border-border bg-muted/30">
                                                <Stack direction="row" gap={3} align="center" className="mb-3">
                                                    <Badge className={cn("rounded-md text-xs", METHOD_COLORS[ep.method] || METHOD_COLORS.GET)}>
                                                        {ep.method}
                                                    </Badge>
                                                    <Heading level={4} className="font-mono">{ep.path}</Heading>
                                                </Stack>
                                                <Text variant="muted" className="leading-relaxed mb-4">
                                                    {ep.description || L.messages?.noDescriptionProvided}
                                                </Text>
                                                <Stack direction="row" gap={4}>
                                                    <Stack direction="row" gap={1} align="center" className="text-xs text-muted-foreground">
                                                        <Icons.lock className="size-3.5" />
                                                        Role <Badge variant="secondary" className="font-mono">{ep.minRoleLevel || 0}</Badge>
                                                    </Stack>
                                                    <Stack direction="row" gap={1} align="center" className="text-xs text-muted-foreground">
                                                        <Icons.folder className="size-3.5" />
                                                        {categories.find(c => c.id === ep.categoryId)?.name || 'Uncategorized'}
                                                    </Stack>
                                                </Stack>
                                            </div>

                                            <CardContent className="space-y-6">
                                                <div>
                                                    <Text variant="detail" className="mb-2 flex items-center gap-2">
                                                        <Icons.code className="size-3.5" />
                                                        Response Schema
                                                    </Text>
                                                    <div className="bg-foreground rounded-xl p-4 overflow-x-auto relative group">
                                                        <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
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
                                                                addToast('Copied', 'success');
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 bg-background/10 rounded-md text-background opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Icons.copy className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        navigator.clipboard.writeText(ep.responseData || '{}');
                                                        addToast('Copied to clipboard', 'success');
                                                    }}>
                                                        <Icons.copy className="size-3.5 mr-1" />
                                                        Copy Schema
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </>
                                    );
                                })()}
                            </Card>
                        ) : (
                            <Card  className="h-80 flex flex-col items-center justify-center">
                                <div className="size-12 bg-muted rounded-xl flex items-center justify-center mb-4 text-border">
                                    <Icons.rocket className="size-6" />
                                </div>
                                <Text>{L.explorer?.noEndpointSelected}</Text>
                                <Text variant="muted" className="text-xs">{L.explorer?.selectEndpointHint}</Text>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
