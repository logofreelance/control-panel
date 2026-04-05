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
                <Card className="max-w-md p-12 rounded-3xl border-2 border-foreground/5 shadow-none">
                    <Icons.search className="size-16 text-muted-foreground/10 mx-auto mb-8 shadow-none" />
                    <TextHeading size="h6" className="mb-2 lowercase">route not found</TextHeading>
                    <p className="mb-10 text-xs text-muted-foreground/40 lowercase leading-relaxed">the documentation for this specific endpoint could not be found within the current lineage.</p>
                    <Button onClick={onBack} variant="outline" className="rounded-xl h-10 px-8 text-xs lowercase">return to list</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs */}
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                    <button onClick={onBack} className="hover:text-foreground transition-all">auth protocols</button>
                    <Icons.chevronRight className="size-3" />
                    <span className="text-foreground/40 bg-muted/20 px-2 py-0.5 rounded-lg">endpoint schema</span>
                </div>
            </div>

            {/* Hero Header Card */}
            <Card className="p-8 sm:p-12 rounded-[2.5rem] border-2 border-foreground/5 bg-card shadow-none relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className={cn("mt-1 size-16 sm:size-20 rounded-[1.5rem] flex items-center justify-center text-foreground shadow-none border-4 border-background", METHOD_COLORS[route.method]?.replace('text-', 'bg-').replace('-600', '-500/10') || 'bg-muted')}>
                            <span className="text-2xl font-bold tracking-tighter opacity-80">{route.method[0]}</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className={cn("rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border-none", METHOD_COLORS[route.method] || METHOD_COLORS.GET)}>
                                    {route.method}
                                </Badge>
                                <code className="text-xl sm:text-2xl font-bold font-mono tracking-tighter text-foreground bg-muted/30 px-3 py-1 rounded-xl">
                                    {route.path}
                                </code>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground/60 leading-relaxed max-w-2xl lowercase font-medium">
                                {route.description || "this endpoint is part of the system's core auth lineage protocols."}
                            </p>
                        </div>
                    </div>
                    <Button variant="default" onClick={() => openInTester(route.method, route.path, route.body)} className="rounded-2xl h-14 px-8 lowercase text-sm font-semibold tracking-wide gap-3 shadow-none active:scale-95 transition-all">
                        <Icons.flask className="size-5" />
                        open in live tester
                    </Button>
                </div>
                {/* Decorative background light */}
                <div className={cn("absolute -top-20 -right-20 size-80 rounded-full blur-[100px] opacity-20", METHOD_COLORS[route.method]?.replace('text-', 'bg-').replace('-600', '-500') || 'bg-muted')} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Protocol Info */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden">
                        <CardContent className="p-8">
                            <p className="text-[10px] font-bold text-muted-foreground/10 uppercase tracking-[0.2em] mb-8">security lineage</p>
                            <div className="space-y-5">
                                <div className="p-5 rounded-2xl bg-muted/20 border-2 border-border/5 group hover:border-foreground/5 transition-all">
                                    <div className="flex flex-row gap-5 items-center">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center shadow-none transition-transform group-hover:scale-110", (route.notes || '').includes('Protected') ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary')}>
                                            {(route.notes || '').includes('Protected') ? <Icons.lock className="size-5" /> : <Icons.shield className="size-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest mb-1">access level</p>
                                            <p className="text-xs font-bold text-foreground/70 lowercase truncate tracking-tight">{route.notes || 'public (unrestricted)'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-muted/20 border-2 border-border/5 group hover:border-foreground/5 transition-all">
                                    <div className="flex flex-row gap-5 items-center">
                                        <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shadow-none transition-transform group-hover:scale-110">
                                            <Icons.zap className="size-5 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest mb-1">auth protocol</p>
                                            <code className="text-[11px] font-mono font-bold text-indigo-600/60 break-all">{route.headers || "NO_AUTH"}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden">
                        <CardContent className="p-8">
                            <p className="text-[10px] font-bold text-muted-foreground/10 uppercase tracking-[0.2em] mb-8">response states</p>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-muted/5 border-2 border-border/5 group hover:border-blue-500/10 transition-all">
                                    <div className="flex flex-row justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <p className="text-[11px] font-bold text-foreground/60 lowercase">success</p>
                                        </div>
                                        <Badge className="rounded-lg text-[10px] bg-blue-500/10 text-blue-600 font-bold px-2 py-0.5 border-none shadow-none">{route.httpStatus || 200} ok</Badge>
                                    </div>
                                </div>
                                {(route.errors || []).map((err, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-muted/5 border-2 border-border/5 group hover:border-red-500/10 transition-all">
                                        <div className="flex flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="size-2 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                                                <p className="text-[11px] text-muted-foreground/40 lowercase truncate font-medium">{err.description}</p>
                                            </div>
                                            <Badge className="rounded-lg text-[10px] bg-red-500/10 text-red-600 font-bold px-2 py-0.5 border-none shadow-none shrink-0">{err.code}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Request Payload Section */}
                    <div className="space-y-6">
                        <div className="flex flex-row justify-between items-center px-1">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 shadow-none border-2 border-emerald-500/5">
                                    <Icons.send className="size-5 text-emerald-600" />
                                </div>
                                <TextHeading size="h5" className="lowercase font-bold tracking-tight">request payload schema</TextHeading>
                            </div>
                            {route.body && (
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(route.body!)} className="h-10 px-5 rounded-xl lowercase text-xs gap-2 hover:bg-muted/30">
                                    <Icons.copy className="size-3.5" />
                                    copy schema
                                </Button>
                            )}
                        </div>
                        {route.body ? (
                            <div className="bg-foreground rounded-[2rem] p-10 relative group overflow-hidden shadow-none border-none">
                                <pre className="text-xs sm:text-sm text-emerald-400 font-mono whitespace-pre leading-relaxed relative z-10 scrollbar-none">{route.body}</pre>
                                <div className="absolute -bottom-10 -right-10 size-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                            </div>
                        ) : (
                            <div className="p-20 border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center text-center rounded-[2rem] bg-muted/5 group hover:border-foreground/10 transition-all">
                                <Icons.info className="size-12 text-muted-foreground/10 mb-6 group-hover:scale-110 transition-transform" />
                                <p className="text-xs text-muted-foreground/30 lowercase font-medium tracking-wide">no request payload required for this lineage.</p>
                            </div>
                        )}
                    </div>

                    {/* Response Schema Section */}
                    {route.response && (
                        <div className="space-y-6">
                            <div className="flex flex-row justify-between items-center px-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 shadow-none border-2 border-blue-500/5">
                                        <Icons.check className="size-5 text-blue-600" />
                                    </div>
                                    <TextHeading size="h5" className="lowercase font-bold tracking-tight">response data model</TextHeading>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(route.response!)} className="h-10 px-5 rounded-xl lowercase text-xs gap-2 hover:bg-muted/30">
                                    <Icons.copy className="size-3.5" />
                                    copy response
                                </Button>
                            </div>
                            <Card className="p-10 rounded-[2rem] bg-card border-2 border-foreground/5 shadow-none group overflow-hidden">
                                <pre className="text-xs sm:text-sm text-foreground/70 font-mono whitespace-pre leading-relaxed scrollbar-none">{route.response}</pre>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
