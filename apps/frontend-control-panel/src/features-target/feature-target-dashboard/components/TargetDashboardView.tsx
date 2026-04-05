'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Skeleton,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import { Icons } from '@/lib/config/client';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { useTargetDashboard } from '../hooks/useTargetDashboard';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';

export function TargetDashboardView() {
  const params = useParams();
  const nodeId = (params?.id as string) || '';

  const { target, loading, handleCheckHealth, checkingHealth, metrics, isOnline } =
    useTargetDashboard(nodeId);

  // CLEAN MONOCHROME METRICS WITH CURATED GLOBAL COLORS
  const summaryCards = useMemo(() => {
    if (!metrics) return [];

    const cardConfigs: Record<string, { icon: any; sub: string; color: string }> = {
      users: {
        icon: <Icons.users className="size-5" />,
        sub: 'active connections',
        color: 'text-chart-1 bg-chart-1/10',
      },
      routes: {
        icon: <Icons.routes className="size-5" />,
        sub: 'active endpoints',
        color: 'text-chart-2 bg-chart-2/10',
      },
      apikeys: {
        icon: <Icons.key className="size-5" />,
        sub: 'active credentials',
        color: 'text-chart-3 bg-chart-3/10',
      },
      schema: {
        icon: <Icons.table className="size-5" />,
        sub: 'entities detected',
        color: 'text-chart-4 bg-chart-4/10',
      },
    };

    return metrics.map((m) => {
      const config = cardConfigs[m.key] || {
        icon: <Icons.circle className="size-5" />,
        sub: '',
        color: 'text-muted-foreground bg-muted',
      };
      return { ...m, ...config };
    });
  }, [metrics]);

  if (loading)
    return (
      <TargetLayout>
        <div className="w-full max-w-7xl mx-auto py-12 md:py-20 px-6 lg:px-10 flex flex-col gap-14">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-96 rounded-xl" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-10 flex flex-col gap-8">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="size-10 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TargetLayout>
    );

  if (!target)
    return (
      <TargetLayout>
        <div className="max-w-2xl mx-auto mt-20 px-6">
          <Alert
            variant="destructive"
            className="border-none bg-destructive/10 backdrop-blur-sm p-8 rounded-3xl"
          >
            <div className="flex items-start gap-4">
              <Icons.alertTriangle className="size-6 text-destructive mt-1" />
              <div className="flex flex-col gap-2">
                <AlertTitle className="text-xl font-medium text-destructive leading-none">
                  Connection failure detected
                </AlertTitle>
                <AlertDescription className="text-destructive/80 leading-relaxed font-instrument">
                  The requested instance node could not be synchronized. This might be due to
                  network latency or an invalid reference key.
                </AlertDescription>
                <Button
                  variant="outline"
                  className="mt-4 w-fit rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10"
                  onClick={() => window.location.reload()}
                >
                  <Icons.refresh className="size-4 mr-2" />
                  Attempt reconnect
                </Button>
              </div>
            </div>
          </Alert>
        </div>
      </TargetLayout>
    );

  return (
    <TargetLayout>
      <div className="relative w-full min-h-screen bg-background font-instrument overflow-x-hidden pb-20">
        <div className="relative z-10 w-full max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-10 flex flex-col gap-8 animate-spring">
          {/* FLAT LUXURY HEADER */}
          <header className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={handleCheckHealth}
              disabled={checkingHealth}
              className="group h-10 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-medium border-border bg-background/50 backdrop-blur-sm transition-all active:scale-95 text-foreground/80 hover:text-foreground flex items-center gap-0 hover:gap-2 shadow-none"
            >
              <Icons.refresh
                className={cn('size-4 text-primary', checkingHealth && 'animate-spin')}
              />
              <span
                className={cn(
                  'max-w-0 opacity-0 overflow-hidden transition-all duration-500 whitespace-nowrap text-sm sm:text-base',
                  'group-hover:max-w-xs group-hover:opacity-100',
                )}
              >
                {checkingHealth ? 'Synchronizing' : 'Sync node'}
              </span>
            </Button>
          </header>

          {/* FLAT LUXURY SUMMARY CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {summaryCards.map((metric) => (
              <Card
                key={metric.key}
                className="bg-card border-4 border-border/10 rounded-2xl sm:rounded-3xl p-0 transition-all duration-300 hover:border-primary/20"
              >
                <CardContent className="p-3 sm:p-4 flex flex-col gap-4 sm:gap-5">
                  <div className="flex items-start justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground font-normal tracking-tight lowercase">
                      {metric.label}
                    </span>
                    <div
                      className={cn(
                        'size-8 sm:size-10 aspect-square rounded-full flex items-center justify-center transition-all group-hover/card:rotate-6 group-hover/card:scale-110',
                        metric.color,
                      )}
                    >
                      <div className="scale-75 sm:scale-100">{metric.icon}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <TextHeading
                      as="span"
                      size="h2"
                      weight="semibold"
                      className="text-xl sm:text-4xl md:text-5xl lg:text-5xl tracking-tighter leading-none text-foreground"
                    >
                      {metric.value || '0'}
                    </TextHeading>
                    <span className="text-[10px] sm:text-xs font-normal text-muted-foreground lowercase tracking-tight">
                      {metric.sub}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* TELEMETRY FOOTER */}
          <footer className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-12 gap-y-6 pt-10">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <Icons.clock className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground font-normal lowercase tracking-tight">
                  system uptime
                </span>
                <span className="text-base text-foreground/70 font-normal">
                  99.98% availability
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <Icons.zap className="size-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground font-normal lowercase tracking-tight">
                  latency
                </span>
                <span className="text-base text-foreground/70 font-normal">24ms average</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <Icons.shieldCheck className="size-3.5 text-chart-2" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground font-normal lowercase tracking-tight">
                  security
                </span>
                <span className="text-base text-foreground/70 font-normal">ssl 256-bit active</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </TargetLayout>
  );
}
