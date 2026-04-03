import React from 'react';
import { Button, Card, CardContent, Heading, Text, Stack, Badge } from '@/components/ui';
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
                <Card  className="max-w-md w-full text-center p-10">
                    <div className="size-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Icons.error className="size-8 text-destructive" />
                    </div>
                    <Heading level={4} className="mb-2">{L.labels.loadFailed}</Heading>
                    <Text variant="muted" className="mb-8 leading-relaxed">{error}</Text>
                    <Button onClick={() => window.location.reload()} size="sm" variant="outline">
                        {L.labels.tryAgain}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <Stack direction="row" justify="between" align="center" className="flex-col items-start md:flex-row md:items-center gap-6">
                <Stack direction="row" gap={4} align="center">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icons.shield className="size-6 text-primary" />
                    </div>
                    <div>
                        <Heading level={3}>{L.title}</Heading>
                        <Text variant="muted">{L.subtitle}</Text>
                    </div>
                </Stack>
                <Stack direction="row" gap={3}>
                    <Button variant="outline" size="sm" onClick={goBack}>
                        <Icons.back className="size-4 mr-2" />
                        {L.buttons.back}
                    </Button>
                    <Button variant="default" size="sm" onClick={goToTester}>
                        <Icons.flask className="size-4 mr-2" />
                        {L.buttons.apiTester}
                    </Button>
                </Stack>
            </Stack>

            {/* Stats Grid */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-3xl">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <section className="grid grid-cols-2 gap-4">
                    <Card variant="elevated" className="p-6">
                        <Stack direction="row" justify="between" align="start" className="mb-4">
                            <Text variant="detail">{L.labels.total}</Text>
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Icons.link className="size-4" />
                            </div>
                        </Stack>
                        <Heading level={2}>{statsValues.total}</Heading>
                        <Text variant="muted" className="mt-1">{L.labels.endpoints}</Text>
                    </Card>
                    <Card variant="elevated" className="p-6">
                        <Stack direction="row" justify="between" align="start" className="mb-4">
                            <Text variant="detail">{L.labels.auth}</Text>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                                <Icons.shield className="size-4" />
                            </div>
                        </Stack>
                        <Heading level={2}>{statsValues.auth}</Heading>
                        <Text variant="muted" className="mt-1">Protected Security Layers</Text>
                    </Card>
                </section>
            </div>

            {/* Category Sections */}
            <div className="relative space-y-4">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-3xl">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {(authRoutes || []).map(category => {
                    const isExpanded = expandedCategory === category.category;
                    const CategoryIcon = category.Icon;
                    return (
                        <Card key={category.category} >
                            <button
                                onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                                className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-3xl"
                            >
                                <Stack direction="row" gap={4} align="center">
                                    <div className={cn(
                                        "size-10 rounded-xl flex items-center justify-center transition-colors",
                                        isExpanded ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                                    )}>
                                        <CategoryIcon className="size-5" />
                                    </div>
                                    <div className="text-left">
                                        <Text className="text-sm font-semibold">{category.category}</Text>
                                        <Text variant="detail">{category.routes.length} {L.labels.endpoints}</Text>
                                    </div>
                                </Stack>
                                <div className={cn("p-1 rounded-full bg-muted text-muted-foreground transition-transform", isExpanded ? 'rotate-180' : '')}>
                                    <Icons.chevronDown className="size-4" />
                                </div>
                            </button>

                            <div className={cn("transition-all duration-500 overflow-hidden", isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0')}>
                                <div className="px-3 pb-3 space-y-1">
                                    {category.routes.map((route, idx) => {
                                        const routeId = btoa(`${route.method}:${route.path}`).replace(/=/g, '');
                                        return (
                                            <button
                                                key={idx}
                                                className="w-full p-4 rounded-xl hover:bg-muted/30 transition-colors group flex items-center justify-between text-left"
                                                onClick={() => onNavigate('auth_detail', routeId)}
                                            >
                                                <Stack direction="row" gap={4} align="center" className="min-w-0">
                                                    <Badge className={cn("rounded-lg text-[10px]", METHOD_STYLES[route.method] || METHOD_STYLES.GET)}>
                                                        {route.method}
                                                    </Badge>
                                                    <div className="min-w-0">
                                                        <code className="block font-mono text-sm text-foreground truncate group-hover:text-primary transition-colors">{route.path}</code>
                                                        <Text variant="muted" className="text-[11px] truncate">{route.description}</Text>
                                                    </div>
                                                </Stack>
                                                <Icons.chevronRight className="size-4 text-border opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Technical Notes */}
            <Card className="p-10 bg-foreground text-background rounded-3xl relative overflow-hidden">
                <Stack direction="row" gap={4} align="center" className="mb-8 relative z-10">
                    <div className="size-12 rounded-2xl bg-background/10 flex items-center justify-center">
                        <Icons.tip className="size-6 text-primary" />
                    </div>
                    <div>
                        <Heading level={4} className="text-background">{L.labels.notes}</Heading>
                        <Text className="text-xs text-background/50">Platform Implementation Standards</Text>
                    </div>
                </Stack>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                        { icon: Icons.users, color: 'bg-blue-500/10 text-blue-400', title: 'User Engine', desc: L.notes.userManagement.replace('User Authentication', 'Auth System') },
                        { icon: Icons.shield, color: 'bg-emerald-500/10 text-emerald-400', title: 'Security Headers', desc: L.notes.authHeader },
                        { icon: Icons.flask, color: 'bg-amber-500/10 text-amber-400', title: 'Endpoint Testing', desc: L.notes.clickTest },
                    ].map((item, i) => (
                        <Card key={i}  className="p-5 bg-background/5 border-background/10 hover:bg-background/10 transition-colors">
                            <div className={cn("size-10 rounded-xl flex items-center justify-center mb-4", item.color)}>
                                <item.icon className="size-5" />
                            </div>
                            <Text className="text-xs font-semibold text-background mb-2">{item.title}</Text>
                            <Text className="text-[11px] text-background/50 leading-relaxed">{item.desc}</Text>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    );
};
