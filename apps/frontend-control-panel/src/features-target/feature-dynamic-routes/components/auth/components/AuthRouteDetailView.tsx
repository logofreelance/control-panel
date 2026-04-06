'use client';

import React, { useMemo } from 'react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useAuthRoutes } from '../composables/useAuthRoutes';

const L = DYNAMIC_ROUTES_LABELS.authRoutes;

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-600',
    POST: 'bg-emerald-500/10 text-emerald-600',
    PUT: 'bg-amber-500/10 text-amber-600',
    DELETE: 'bg-rose-500/10 text-rose-600',
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
                <Card className="max-w-md p-8 bg-muted/20">
                    <Icons.search className="size-16 text-muted-foreground mx-auto mb-6" />
                    <TextHeading size="h6" className="mb-2 lowercase">route not found</TextHeading>
                    <p className="mb-10 text-base text-muted-foreground lowercase leading-relaxed">the documentation for this specific endpoint could not be found within the current lineage.</p>
                    <Button onClick={onBack} variant="outline" className="lowercase">return to list</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs */}
            <div className="flex flex-row items-center justify-between px-1">
                <div className="flex flex-row items-center gap-3 text-sm font-medium text-muted-foreground lowercase">
                    <button onClick={onBack} className="hover:text-foreground transition-all">auth protocols</button>
                    <Icons.chevronRight className="size-3.5" />
                    <span className="text-foreground bg-muted/40 px-2.5 py-0.5 rounded-lg">endpoint schema</span>
                </div>
            </div>

            {/* Hero Header Card */}
            <Card className="p-6 sm:p-8 bg-card relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className={cn("size-16 sm:size-20 rounded-xl flex items-center justify-center text-foreground border-none", METHOD_COLORS[route.method]?.replace('text-', 'bg-').replace('-600', '-500/10') || 'bg-muted')}>
                            <span className="text-2xl font-bold">{route.method[0]}</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className={cn("rounded-lg px-3 py-1 text-sm font-bold lowercase", METHOD_COLORS[route.method] || METHOD_COLORS.GET)}>
                                    {route.method}
                                </div>
                                <span className="text-2xl sm:text-3xl font-bold text-foreground bg-muted/30 px-3 py-1 rounded-lg">
                                    {route.path}
                                </span>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl lowercase font-medium">
                                {route.description || "this endpoint is part of the system's core auth lineage protocols."}
                            </p>
                        </div>
                    </div>
                    <Button variant="default" size="lg" onClick={() => openInTester(route.method, route.path, route.body)} className="lowercase gap-3 active:scale-95 transition-all">
                        <Icons.flask className="size-5" />
                        open in live tester
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Protocol Info */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-card overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-medium text-muted-foreground lowercase mb-6">security lineage</p>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/20 border-none group transition-all">
                                    <div className="flex flex-row gap-5 items-center">
                                        <div className={cn("size-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", (route.notes || '').includes('Protected') ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary')}>
                                            {(route.notes || '').includes('Protected') ? <Icons.lock className="size-5" /> : <Icons.shield className="size-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-muted-foreground lowercase mb-0.5">access level</p>
                                            <p className="text-base font-medium text-foreground lowercase truncate">{route.notes || 'public (unrestricted)'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/20 border-none group transition-all">
                                    <div className="flex flex-row gap-5 items-center">
                                        <div className="size-11 rounded-xl bg-indigo-500/10 flex items-center justify-center transition-transform group-hover:scale-105">
                                            <Icons.zap className="size-5 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-muted-foreground lowercase mb-0.5">auth protocol</p>
                                            <span className="text-base font-medium text-indigo-600 break-all">{route.headers || "no_auth"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-medium text-muted-foreground lowercase mb-6">response states</p>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-muted/5 border-none group hover:bg-muted/10 transition-all">
                                    <div className="flex flex-row justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="size-2 rounded-full bg-blue-500" />
                                            <p className="text-base font-medium text-foreground lowercase">success</p>
                                        </div>
                                        <div className="rounded-lg text-sm bg-blue-500/10 text-blue-600 font-bold px-2.5 py-0.5 lowercase">{route.httpStatus || 200} ok</div>
                                    </div>
                                </div>
                                {(route.errors || []).map((err, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-muted/5 border-none group hover:bg-muted/10 transition-all">
                                        <div className="flex flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                                                <p className="text-sm text-muted-foreground lowercase truncate font-medium">{err.description}</p>
                                            </div>
                                            <div className="rounded-lg text-sm bg-rose-500/10 text-rose-600 font-bold px-2.5 py-0.5 lowercase shrink-0">{err.code}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Request Payload Section */}
                    <div className="space-y-4">
                        <div className="flex flex-row justify-between items-center px-1">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border-none">
                                    <Icons.send className="size-5 text-emerald-600" />
                                </div>
                                <TextHeading size="h5" className="lowercase font-bold">request payload schema</TextHeading>
                            </div>
                            {route.body && (
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(route.body!)} className="lowercase gap-2 hover:bg-muted/30">
                                    <Icons.copy className="size-4" />
                                    copy schema
                                </Button>
                            )}
                        </div>
                        {route.body ? (
                            <div className="bg-muted/30 rounded-xl p-6 relative group overflow-hidden border-none">
                                <div className="text-base text-foreground leading-relaxed overflow-x-auto scrollbar-none font-normal whitespace-pre">{route.body}</div>
                            </div>
                        ) : (
                            <div className="p-16 border-none flex flex-col items-center justify-center text-center rounded-xl bg-muted/20 group transition-all">
                                <Icons.info className="size-12 text-muted-foreground mb-4 opacity-40" />
                                <p className="text-base text-muted-foreground lowercase">no request payload required for this lineage.</p>
                            </div>
                        )}
                    </div>

                    {/* Response Schema Section */}
                    {route.response && (
                        <div className="space-y-4">
                            <div className="flex flex-row justify-between items-center px-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 border-none">
                                        <Icons.check className="size-5 text-blue-600" />
                                    </div>
                                    <TextHeading size="h5" className="lowercase font-bold">response data model</TextHeading>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(route.response!)} className="lowercase gap-2 hover:bg-muted/30">
                                    <Icons.copy className="size-4" />
                                    copy response
                                </Button>
                            </div>
                            <Card className="p-6 bg-muted/30 group overflow-hidden">
                                <div className="text-base text-foreground leading-relaxed scrollbar-none whitespace-pre">{route.response}</div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
