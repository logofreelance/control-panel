'use client';

import React, { useMemo } from 'react';
import { Button, Card, CardContent, Heading, Text, Stack, Badge } from '@/components/ui';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useAuthRoutes } from '../composables/useAuthRoutes';

const L = DYNAMIC_ROUTES_LABELS.authRoutes;

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-600',
    POST: 'bg-emerald-500/10 text-emerald-600',
    PUT: 'bg-amber-500/10 text-amber-600',
    DELETE: 'bg-red-500/10 text-red-600',
    PATCH: 'bg-purple-500/10 text-purple-600',
};

interface AuthRouteDetailViewProps {
    targetId: string;
    routeId: string;
    onBack: () => void;
    onNavigate: (view: string, id?: string) => void;
}

export const AuthRouteDetailView = ({ targetId, routeId, onBack, onNavigate }: AuthRouteDetailViewProps) => {
    const { authRoutes, openInTester, loading } = useAuthRoutes(targetId);

    const route = useMemo(() => {
        try {
            const decoded = atob(routeId);
            const [method, path] = decoded.split(':');
            for (const category of (authRoutes || [])) {
                const found = category.routes.find(r => r.method === method && r.path === path);
                if (found) return found;
            }
        } catch (e) {
            console.error('Failed to decode routeId', e);
        }
        return null;
    }, [authRoutes, routeId]);

    if (loading && !route) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!route) {
        return (
            <div className="flex h-[60vh] items-center justify-center p-6 text-center">
                <Card  className="max-w-md p-10">
                    <Icons.search className="size-12 text-border mx-auto mb-6" />
                    <Heading level={4} className="mb-2">Route Not Found</Heading>
                    <Text variant="muted" className="mb-8">The documentation for this specific endpoint could not be found.</Text>
                    <Button onClick={onBack} variant="outline">Return to List</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <Stack direction="row" justify="between" align="center">
                <Stack direction="row" gap={2} align="center" className="text-xs font-medium text-muted-foreground">
                    <button onClick={onBack} className="hover:text-primary transition-colors uppercase">Security & Auth</button>
                    <Icons.chevronRight className="size-3" />
                    <span className="text-foreground uppercase">Endpoint Documentation</span>
                </Stack>
            </Stack>

            {/* Hero Header */}
            <Card  className="p-8">
                <Stack direction="row" justify="between" align="center" className="flex-col items-start md:flex-row md:items-center gap-8">
                    <Stack direction="row" gap={5} align="start">
                        <div className={cn("mt-1 size-14 rounded-2xl flex items-center justify-center text-foreground", METHOD_COLORS[route.method]?.replace('text-', 'bg-').replace('-600', '-500/20') || 'bg-muted')}>
                            <span className="text-lg font-bold">{route.method[0]}</span>
                        </div>
                        <div>
                            <Stack direction="row" gap={3} align="center" className="mb-2">
                                <Badge className={cn("rounded-lg text-[10px]", METHOD_COLORS[route.method] || METHOD_COLORS.GET)}>
                                    {route.method}
                                </Badge>
                                <Heading level={3} className="font-mono break-all">{route.path}</Heading>
                            </Stack>
                            <Text variant="muted" className="leading-relaxed max-w-2xl">{route.description}</Text>
                        </div>
                    </Stack>
                    <Button variant="default" onClick={() => openInTester(route.method, route.path, route.body)}>
                        <Icons.flask className="size-5 mr-2" />
                        Open in Live Tester
                    </Button>
                </Stack>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Card >
                        <CardContent className="p-6">
                            <Text variant="detail" className="mb-5">Security Protocol</Text>
                            <Stack gap={4}>
                                <Card  className="p-4">
                                    <Stack direction="row" gap={4} align="center">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center", (route.notes || '').includes('Protected') ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary')}>
                                            {(route.notes || '').includes('Protected') ? <Icons.lock className="size-5" /> : <Icons.shield className="size-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <Text variant="detail">Access Level</Text>
                                            <Text className="text-sm truncate">{route.notes || 'Public Access'}</Text>
                                        </div>
                                    </Stack>
                                </Card>
                                <Card  className="p-4">
                                    <Stack direction="row" gap={4} align="center">
                                        <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <Icons.zap className="size-5 text-emerald-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <Text variant="detail">Authentication Style</Text>
                                            <code className="text-[11px] font-mono text-emerald-600 break-all">{route.headers}</code>
                                        </div>
                                    </Stack>
                                </Card>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card >
                        <CardContent className="p-6">
                            <Text variant="detail" className="mb-5">Response States</Text>
                            <Stack gap={3}>
                                <Card  className="p-3">
                                    <Stack direction="row" justify="between" align="center">
                                        <Stack direction="row" gap={3} align="center">
                                            <span className="size-2 rounded-full bg-blue-500" />
                                            <Text className="text-xs font-semibold">Success</Text>
                                        </Stack>
                                        <Badge className="rounded-md text-[10px] bg-blue-500/10 text-blue-600 font-mono">{route.httpStatus} OK</Badge>
                                    </Stack>
                                </Card>
                                {(route.errors || []).map((err, idx) => (
                                    <Card key={idx}  className="p-3">
                                        <Stack direction="row" justify="between" align="center">
                                            <Stack direction="row" gap={3} align="center" className="min-w-0">
                                                <span className="size-2 rounded-full bg-red-400 shrink-0" />
                                                <Text className="text-xs truncate">{err.description}</Text>
                                            </Stack>
                                            <Badge className="rounded-md text-[10px] bg-red-500/10 text-red-600 font-mono shrink-0">{err.code}</Badge>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Request Payload */}
                    <section>
                        <Stack direction="row" justify="between" align="center" className="mb-4">
                            <Heading level={4} className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Icons.send className="size-4 text-emerald-600" />
                                </div>
                                JSON Request Body
                            </Heading>
                            {route.body && (
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(route.body!)}>
                                    <Icons.copy className="size-3.5 mr-1" />
                                    Copy Schema
                                </Button>
                            )}
                        </Stack>
                        {route.body ? (
                            <div className="bg-foreground rounded-3xl p-8 relative group overflow-hidden">
                                <pre className="text-sm text-emerald-400 font-mono whitespace-pre leading-relaxed relative z-10">{route.body}</pre>
                            </div>
                        ) : (
                            <Card  className="p-12 border-dashed border-border flex flex-col items-center justify-center text-center">
                                <Icons.info className="size-8 text-border mb-3" />
                                <Text variant="muted" className="italic">No request payload required for this endpoint.</Text>
                            </Card>
                        )}
                    </section>

                    {/* Success Response */}
                    {route.response && (
                        <section>
                            <Stack direction="row" justify="between" align="center" className="mb-4">
                                <Heading level={4} className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Icons.check className="size-4 text-primary" />
                                    </div>
                                    Success Response Model
                                </Heading>
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(route.response!)}>
                                    <Icons.copy className="size-3.5 mr-1" />
                                    Copy Response
                                </Button>
                            </Stack>
                            <Card  className="p-8">
                                <pre className="text-sm text-foreground font-mono whitespace-pre leading-relaxed">{route.response}</pre>
                            </Card>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
