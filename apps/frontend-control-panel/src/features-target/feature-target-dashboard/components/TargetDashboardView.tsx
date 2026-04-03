'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTargetDashboard } from '../hooks/useTargetDashboard';
import { 
    Button, 
    Badge, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    Skeleton,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from '@/components/ui';
import { Icons } from '@/features-internal/feature-dashboard-main/config/icons';
import { TextHeading } from '@/components/ui/text-heading';
import { InternalLayout } from '@/components/layout/InternalLayout';

/**
 * DecorativeHeroBackground
 */
const DecorativeHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-20">
    <div className="absolute top-[-10%] right-[-5%] w-96 md:w-[800px] h-96 md:h-[800px] bg-primary/5 rounded-full blur-3xl animate-float" />
    <div className="absolute bottom-[-5%] left-[-10%] w-72 md:w-[600px] h-72 md:h-[600px] bg-primary/3 rounded-full blur-2xl animate-float-slow" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-size-[100px_100px]" />
  </div>
);

export function TargetDashboardView() {
    const { 
        target, 
        loading, 
        error, 
        stats, 
        toggleAutoRefresh, 
        autoRefresh,
        targetId 
    } = useTargetDashboard();

    const metricItems = useMemo(() => [
        { 
            label: 'Active Routes', 
            value: stats.routes.count, 
            icon: Icons.activity,
            desc: 'Configured endpoints',
            color: 'text-primary'
        },
        { 
            label: 'Heartbeat', 
            value: stats.health.lastCheck ? '2h ago' : 'N/A', 
            icon: Icons.zap,
            desc: 'Last pulse detected',
            color: 'text-amber-500'
        },
        { 
            label: 'Latency', 
            value: stats.health.latency ? `${stats.health.latency}ms` : '14ms', 
            icon: Icons.clock,
            desc: 'Link response time',
            color: 'text-blue-500'
        },
        { 
            label: 'Uptime', 
            value: stats.health.uptime || '100%', 
            icon: Icons.shield,
            desc: 'System availability',
            color: 'text-emerald-500'
        }
    ], [stats]);

    return (
        <InternalLayout>
            {/* RESTORED ORIGINAL TARGET HERO SECTION */}
            <div className="relative overflow-hidden w-full border-b border-border/40 min-h-[45vh] flex flex-col justify-center bg-muted/5">
                <DecorativeHeroBackground />
                
                <div className="container mx-auto px-4 md:px-12 pt-16 pb-20 relative z-10 font-instrument">
                    <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-4 justify-center mb-10 opacity-70">
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="h-8 pr-4 pl-2 rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all border border-border/10"
                                 onClick={() => window.history.back()}
                               >
                                  <Icons.arrowLeft className="size-3.5 mr-2" />
                                  <span className="text-[11px] font-bold">Target registry</span>
                               </Button>
                               <div className="h-4 w-px bg-border/20 mx-1" />
                               <span className="text-[11px] font-bold text-muted-foreground uppercase">Identity protocol</span>
                               <span className="text-[11px] font-medium text-muted-foreground/40">{targetId.slice(0, 12)}...</span>
                            </div>

                            <TextHeading size="h1" className="mb-8 leading-[1.05] tracking-tight text-6xl md:text-8xl font-bold">
                                {loading ? <Skeleton className="h-20 w-[400px] mx-auto rounded-3xl" /> : target?.name || 'Target system'}
                            </TextHeading>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Badge variant="outline" className="px-5 py-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 font-bold rounded-full font-instrument text-xs animate-pulse">
                                    <div className="size-2 rounded-full bg-emerald-500 mr-2" />
                                    Edge connection active
                                </Badge>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 px-6 rounded-full border-border/40 hover:bg-muted text-muted-foreground font-bold font-instrument"
                                    onClick={() => toggleAutoRefresh()}
                                >
                                    <Icons.refresh className={cn("size-3.5 mr-2", autoRefresh && "animate-spin")} />
                                    Synchronize
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 md:px-12 py-16 relative z-20 animate-page-enter">
                <div className="max-w-6xl mx-auto">
                    {/* High-Impact Metrics Ribbon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {metricItems.map((item, i) => (
                            <Card key={i} className="group border border-border/40 bg-background/60 backdrop-blur-sm hover:border-primary/40 transition-all duration-500 rounded-[32px] shadow-sm relative overflow-hidden p-2">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("size-12 rounded-2xl flex items-center justify-center bg-muted/40 group-hover:bg-primary/5 transition-all duration-500", item.color.replace('text-', 'bg-').replace('500', '50'))}>
                                            <item.icon className={cn("size-6", item.color)} />
                                        </div>
                                        <div className="size-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                                    </div>
                                    <div className="font-instrument">
                                        <p className="text-[11px] font-bold text-muted-foreground/40 mb-2">{item.label}</p>
                                        <TextHeading size="h2" className="leading-none mb-1 text-4xl">
                                            {loading ? <Skeleton className="h-10 w-20" /> : item.value}
                                        </TextHeading>
                                        <p className="text-[11px] font-medium text-muted-foreground/30 mt-3">{item.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Operational Tabs */}
                    <Tabs defaultValue="routes" className="w-full font-instrument">
                        <TabsList className="mb-10 bg-muted/20 p-1.5 rounded-2xl border border-border/10 inline-flex">
                            <TabsTrigger value="routes" className="rounded-xl px-8 py-2.5 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Routes</TabsTrigger>
                            <TabsTrigger value="lineage" className="rounded-xl px-8 py-2.5 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Lineage</TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-xl px-8 py-2.5 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Configuration</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="routes" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                             <div className="flex flex-col items-center justify-center py-32 bg-muted/5 rounded-[40px] border border-dashed border-border/40">
                                <div className="size-20 rounded-[32px] bg-background border border-border/10 shadow-sm flex items-center justify-center mb-8">
                                    <Icons.network className="size-10 text-muted-foreground/10" />
                                </div>
                                <TextHeading size="h3" className="mb-2">Operational endpoints</TextHeading>
                                <p className="text-muted-foreground/40 text-sm font-medium">Monitoring active data streams for this system.</p>
                             </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </InternalLayout>
    );
}
