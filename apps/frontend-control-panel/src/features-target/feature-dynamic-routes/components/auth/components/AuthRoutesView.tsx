import React from 'react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useAuthRoutes } from '../composables';

const L = DYNAMIC_ROUTES_LABELS.authRoutes;

const METHOD_STYLES: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-600',
    POST: 'bg-emerald-500/10 text-emerald-600',
    PUT: 'bg-amber-500/10 text-amber-600',
    DELETE: 'bg-red-500/10 text-red-600',
    PATCH: 'bg-purple-500/10 text-purple-600',
};

interface AuthRoutesViewProps {
    targetId?: string;
    onNavigate: (view: string, id: string) => void;
}

export const AuthRoutesView = ({ targetId, onNavigate }: AuthRoutesViewProps) => {
    const {
        loading, error,
        expandedCategory, setExpandedCategory,
        authRoutes,
        statsValues,
        goBack, goToTester,
    } = useAuthRoutes(targetId);

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center p-6">
                <Card className="max-w-md w-full text-center p-12 rounded-3xl border-2 border-red-500/5 bg-red-500/5 shadow-none">
                    <div className="size-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Icons.error className="size-8 text-red-500" />
                    </div>
                    <TextHeading size="h6" className="mb-2 lowercase">{L.labels.loadFailed || "data load failed"}</TextHeading>
                    <p className="mb-8 leading-relaxed text-xs text-muted-foreground/40 lowercase">{error}</p>
                    <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="rounded-xl h-10 px-8 lowercase text-xs">
                        {L.labels.tryAgain || "retry connection"}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-row items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icons.shield className="size-6 text-primary" />
                    </div>
                    <div>
                        <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase tracking-tight">
                            {L.title || "security & auth routes"}
                        </TextHeading>
                        <p className="text-sm text-muted-foreground/60 lowercase leading-relaxed">
                            {L.subtitle || "manage authenticated path lineage and access lists."}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goBack} className="rounded-xl h-10 px-5 text-xs lowercase gap-2 border-2">
                        <Icons.back className="size-4" />
                        {L.buttons.back || "back"}
                    </Button>
                    <Button variant="default" size="sm" onClick={goToTester} className="rounded-xl h-10 px-6 text-xs lowercase gap-2 shadow-none">
                        <Icons.flask className="size-4" />
                        {L.buttons.apiTester || "tester"}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center rounded-[2.5rem]">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-5 sm:gap-8">
                    <Card className="p-8 rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden relative group hover:border-foreground/10 transition-all">
                        <div className="flex flex-row justify-between items-start mb-6">
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{L.labels.total || "lineage count"}</p>
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Icons.link className="size-5" />
                            </div>
                        </div>
                        <TextHeading size="h2" className="mb-1 font-bold">{statsValues.total}</TextHeading>
                        <p className="text-xs text-muted-foreground/40 lowercase">{L.labels.endpoints || "active endpoints"}</p>
                        <div className="absolute -bottom-4 -right-4 size-20 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-500" />
                    </Card>
                    <Card className="p-8 rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden relative group hover:border-foreground/10 transition-all">
                        <div className="flex flex-row justify-between items-start mb-6">
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{L.labels.auth || "protected routes"}</p>
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110">
                                <Icons.shield className="size-5" />
                            </div>
                        </div>
                        <TextHeading size="h2" className="mb-1 font-bold">{statsValues.auth}</TextHeading>
                        <p className="text-xs text-muted-foreground/40 lowercase">security layers active</p>
                        <div className="absolute -bottom-4 -right-4 size-20 rounded-full bg-emerald-500/5 group-hover:scale-150 transition-transform duration-500" />
                    </Card>
                </div>
            </div>

            {/* Category Sections */}
            <div className="relative space-y-4">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center rounded-3xl">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {(authRoutes || []).map((category, idx) => {
                    const isExpanded = expandedCategory === category.category;
                    const CategoryIcon = category.Icon;
                    return (
                        <Card key={category.category} className="rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 40}ms` }}>
                            <button
                                onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                                className="w-full p-6 sm:p-7 flex items-center justify-between hover:bg-muted/10 transition-all group"
                            >
                                <div className="flex flex-row gap-5 items-center">
                                    <div className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center transition-all",
                                        isExpanded ? 'bg-foreground text-background scale-110' : 'bg-muted text-muted-foreground/40 group-hover:bg-muted/80'
                                    )}>
                                        <CategoryIcon className="size-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-foreground/80 lowercase tracking-tight">{category.category}</p>
                                        <p className="text-[10px] text-muted-foreground/30 lowercase mt-1 font-medium italic">{category.routes.length} {L.labels.endpoints || "routes protected"}</p>
                                    </div>
                                </div>
                                <div className={cn("p-2 rounded-xl bg-muted/40 text-muted-foreground/30 transition-all", isExpanded ? 'rotate-180 bg-foreground/5 text-foreground' : '')}>
                                    <Icons.chevronDown className="size-4" />
                                </div>
                            </button>

                            <div className={cn("transition-all duration-500 ease-in-out overflow-hidden bg-muted/5", isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0')}>
                                <div className="p-3 sm:p-5 space-y-2">
                                    {category.routes.map((route, rIdx) => {
                                        const routeId = btoa(`${route.method}:${route.path}`).replace(/=/g, '');
                                        return (
                                            <button
                                                key={rIdx}
                                                className="w-full p-5 rounded-2xl hover:bg-background hover:border-foreground/5 border-2 border-transparent transition-all group/item flex items-center justify-between text-left"
                                                onClick={() => onNavigate('auth_detail', routeId)}
                                            >
                                                <div className="flex flex-row gap-5 items-center min-w-0 flex-1">
                                                    <Badge className={cn("rounded-lg text-[10px] font-bold w-16 text-center shadow-none border-none py-1.5 uppercase tracking-widest", METHOD_STYLES[route.method] || METHOD_STYLES.GET)}>
                                                        {route.method}
                                                    </Badge>
                                                    <div className="min-w-0 flex-1">
                                                        <code className="block font-mono text-sm text-foreground/80 truncate group-hover/item:text-foreground transition-all tracking-tight">{route.path}</code>
                                                        <p className="text-[10px] text-muted-foreground/30 truncate mt-1 lowercase font-medium">{route.description || "no description provided"}</p>
                                                    </div>
                                                </div>
                                                <Icons.chevronRight className="size-4 text-border/20 opacity-0 group-hover/item:opacity-100 -translate-x-4 group-hover/item:translate-x-0 transition-all ml-4" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Technical Notes Panel */}
            <Card className="p-10 sm:p-14 bg-foreground text-background/90 rounded-[3rem] relative overflow-hidden shadow-none border-none">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-12 relative z-10">
                    <div className="size-14 rounded-2xl bg-background/10 flex items-center justify-center shadow-none border-2 border-background/5">
                        <Icons.tip className="size-7 text-background" />
                    </div>
                    <div>
                        <TextHeading size="h4" className="text-background lowercase tracking-tight mb-1">{L.labels.notes || "technical lineage protocol"}</TextHeading>
                        <p className="text-xs text-background/30 lowercase font-medium tracking-[0.2em]">{L.labels.standards || "system implementation architecture"}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {[
                        { icon: Icons.users, color: 'text-blue-400 bg-blue-500/10', title: 'Lineage Identity', desc: L.notes.userManagement || 'authenticated session management for system routes.' },
                        { icon: Icons.shield, color: 'text-emerald-400 bg-emerald-500/10', title: 'Shield Protocol', desc: L.notes.authHeader || 'dynamic security headers required for cross-microservice auth.' },
                        { icon: Icons.flask, color: 'text-amber-400 bg-amber-500/10', title: 'Tester Sync', desc: L.notes.clickTest || 'real-time endpoint verification via the line tester engine.' },
                    ].map((item, i) => (
                        <div key={i} className="group p-6 rounded-3xl bg-background/5 border-2 border-background/5 hover:bg-background/[0.08] hover:border-background/10 transition-all">
                            <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", item.color)}>
                                <item.icon className="size-6" />
                            </div>
                            <p className="text-xs font-bold text-background mb-3 lowercase tracking-wide">{item.title}</p>
                            <p className="text-[11px] text-background/40 leading-relaxed lowercase font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
                {/* Visual Elements */}
                <div className="absolute -top-20 -right-20 size-80 rounded-full bg-background/[0.02] pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-background/[0.03] pointer-events-none" />
            </Card>
        </div>
    );
};
