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
    DELETE: 'bg-rose-500/10 text-rose-600',
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
                <Card className="max-w-md w-full text-center p-8 bg-rose-500/5">
                    <div className="size-16 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <Icons.error className="size-8 text-rose-500" />
                    </div>
                    <TextHeading size="h6" className="mb-2 lowercase">{L.labels.loadFailed || "data load failed"}</TextHeading>
                    <p className="mb-8 leading-relaxed text-sm text-muted-foreground lowercase">{error}</p>
                    <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="lowercase">
                        {L.labels.tryAgain || "retry connection"}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex flex-row items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icons.shield className="size-6 text-primary" />
                    </div>
                    <div>
                        <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase">
                            {L.title || "security & auth routes"}
                        </TextHeading>
                        <p className="text-lg text-muted-foreground lowercase leading-relaxed">
                            {L.subtitle || "manage authenticated path lineage and access lists."}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <Button variant="outline" size="sm" onClick={goBack} className="lowercase">
                        <Icons.back className="size-4 mr-2" />
                        {L.buttons.back || "back"}
                    </Button>
                    <Button variant="default" size="sm" onClick={goToTester} className="lowercase">
                        <Icons.flask className="size-4 mr-2" />
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
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <Card className="p-5 bg-card overflow-hidden relative group hover:bg-muted/30 transition-all">
                        <div className="flex flex-row justify-between items-start mb-6 relative z-10">
                            <p className="text-sm font-medium text-muted-foreground lowercase">{L.labels.total || "lineage count"}</p>
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Icons.link className="size-5" />
                            </div>
                        </div>
                        <TextHeading size="h2" className="text-3xl sm:text-4xl font-bold relative z-10">{statsValues.total}</TextHeading>
                        <p className="text-sm text-muted-foreground lowercase relative z-10">{L.labels.endpoints || "active endpoints"}</p>
                    </Card>
                    <Card className="p-5 bg-card overflow-hidden relative group hover:bg-muted/30 transition-all">
                        <div className="flex flex-row justify-between items-start mb-6 relative z-10">
                            <p className="text-sm font-medium text-muted-foreground lowercase">{L.labels.auth || "protected routes"}</p>
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                                <Icons.shield className="size-5" />
                            </div>
                        </div>
                        <TextHeading size="h2" className="text-3xl sm:text-4xl font-bold relative z-10">{statsValues.auth}</TextHeading>
                        <p className="text-sm text-muted-foreground lowercase relative z-10">security layers active</p>
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
                        <Card key={category.category} className="bg-card overflow-hidden animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 40}ms` }}>
                            <button
                                onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                                className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-muted/10 transition-all group"
                            >
                                <div className="flex flex-row gap-5 items-center">
                                    <div className={cn(
                                        "size-12 rounded-xl flex items-center justify-center transition-all",
                                        isExpanded ? 'bg-foreground text-background scale-105' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                                    )}>
                                        <CategoryIcon className="size-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-base font-medium text-foreground lowercase">{category.category}</p>
                                        <p className="text-sm text-muted-foreground lowercase mt-0.5">{category.routes.length} {L.labels.endpoints || "routes protected"}</p>
                                    </div>
                                </div>
                                <div className={cn("p-2 rounded-xl bg-muted/40 text-muted-foreground transition-all", isExpanded ? 'rotate-180 bg-foreground text-background' : '')}>
                                    <Icons.chevronDown className="size-4" />
                                </div>
                            </button>

                            <div className={cn("transition-all duration-500 ease-in-out overflow-hidden bg-muted/5", isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0')}>
                                <div className="p-2 sm:p-3 space-y-1.5">
                                    {category.routes.map((route, rIdx) => {
                                        const routeId = btoa(`${route.method}:${route.path}`).replace(/=/g, '');
                                        return (
                                            <button
                                                key={rIdx}
                                                className="w-full p-4 rounded-xl hover:bg-background border-none transition-all group/item flex items-center justify-between text-left"
                                                onClick={() => onNavigate('auth_detail', routeId)}
                                            >
                                                <div className="flex flex-row gap-5 items-center min-w-0 flex-1">
                                                    <div className={cn("rounded-lg text-sm font-bold w-16 h-6 flex items-center justify-center shadow-none lowercase", METHOD_STYLES[route.method] || METHOD_STYLES.GET)}>
                                                        {route.method}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block text-base text-foreground truncate group-hover/item:text-foreground transition-all font-sans">{route.path}</span>
                                                        <p className="text-sm text-muted-foreground truncate mt-0.5 lowercase">{route.description || "no description provided"}</p>
                                                    </div>
                                                </div>
                                                <Icons.chevronRight className="size-4 text-border opacity-0 group-hover/item:opacity-100 transition-all ml-4" />
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
            <Card className="p-6 sm:p-10 bg-foreground text-background relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-10 relative z-10">
                    <div className="size-14 rounded-xl bg-background/10 flex items-center justify-center border-none">
                        <Icons.tip className="size-7 text-background" />
                    </div>
                    <div>
                        <TextHeading size="h4" className="text-background lowercase mb-1">{L.labels.notes || "technical lineage protocol"}</TextHeading>
                        <p className="text-base text-background lowercase">system implementation architecture</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    {[
                        { icon: Icons.users, color: 'text-blue-400 bg-blue-500/10', title: 'lineage identity', desc: L.notes.userManagement || 'authenticated session management for system routes.' },
                        { icon: Icons.shield, color: 'text-emerald-400 bg-emerald-500/10', title: 'shield protocol', desc: L.notes.authHeader || 'dynamic security headers required for cross-microservice auth.' },
                        { icon: Icons.flask, color: 'text-amber-400 bg-amber-500/10', title: 'tester sync', desc: L.notes.clickTest || 'real-time endpoint verification via the line tester engine.' },
                    ].map((item, i) => (
                        <div key={i} className="group p-5 rounded-xl bg-background/5 border-none hover:bg-background/10 transition-all">
                            <div className={cn("size-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110", item.color)}>
                                <item.icon className="size-6" />
                            </div>
                            <p className="text-base font-semibold text-background mb-2 lowercase">{item.title}</p>
                            <p className="text-sm text-background leading-relaxed lowercase">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
