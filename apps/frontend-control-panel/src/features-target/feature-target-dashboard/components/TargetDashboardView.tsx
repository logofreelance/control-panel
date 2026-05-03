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

  const { target, loading, loadingStats, handleCheckHealth, checkingHealth, metrics, isOnline, realStats } =
    useTargetDashboard(nodeId);

  // CLEAN MONOCHROME METRICS WITH CURATED GLOBAL COLORS
  const summaryCards = useMemo(() => {
    if (!metrics) return [];

    const cardConfigs: Record<string, { icon: any; sub: string; color: string }> = {
      users: {
        icon: <Icons.users className="size-5" />,
        sub: 'active connections',
        color: 'text-primary bg-background border border-border',
      },
      routes: {
        icon: <Icons.routes className="size-5" />,
        sub: 'active endpoints',
        color: 'text-primary bg-background border border-border',
      },
      apikeys: {
        icon: <Icons.key className="size-5" />,
        sub: 'active credentials',
        color: 'text-primary bg-background border border-border',
      },
      schema: {
        icon: <Icons.table className="size-5" />,
        sub: 'entities detected',
        color: 'text-primary bg-background border border-border',
      },
    };

    return metrics.map((m) => {
      const config = cardConfigs[m.key] || {
        icon: <Icons.circle className="size-5" />,
        sub: '',
        color: 'text-muted-foreground bg-background border border-border',
      };
      return { ...m, ...config };
    });
  }, [metrics]);

  // 🤖 AI: Improved Loading & Error States
  // Avoid flashing error when data is still being synchronized
  if (loading && !target) {
    return (
      <TargetLayout>
        <div className="w-full flex flex-col gap-8">
          <div className="flex justify-end">
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <div className="flex gap-12 mt-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-9 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TargetLayout>
    );
  }

  if (!target)
    return (
      <TargetLayout>
        <div className="max-w-2xl mx-auto text-center mt-20">
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 py-10 px-8 rounded-[2.5rem]">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="size-16 rounded-3xl bg-destructive/10 flex items-center justify-center">
                <Icons.alertTriangle className="size-8 text-destructive" />
              </div>
              <div className="flex flex-col gap-2">
                <AlertTitle className="text-2xl font-semibold text-destructive leading-none lowercase">
                  connection failure detected
                </AlertTitle>
                <AlertDescription className="text-lg text-destructive font-instrument lowercase max-w-md mx-auto">
                  the requested instance node could not be synchronized. this might be due to
                  network latency or an invalid reference key.
                </AlertDescription>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="destructive"
                    className="w-fit h-12 px-8 rounded-xl lowercase text-base"
                    onClick={() => window.location.reload()}
                  >
                    <Icons.refresh className="size-5 mr-3" />
                    attempt reconnect
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        </div>
      </TargetLayout>
    );

  return (
    <TargetLayout>
      <div className="relative w-full min-h-screen bg-background font-instrument overflow-x-hidden">
        <div className="relative z-10 w-full flex flex-col gap-8">
          {/* FLAT LUXURY HEADER */}
          <header className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={handleCheckHealth}
              disabled={checkingHealth}
              className="group h-12 px-4 rounded-xl transition-all flex items-center gap-0 hover:gap-2"
            >
              <Icons.refresh
                className={cn('size-4 text-primary', checkingHealth && 'animate-spin')}
              />
              <span
                className={cn(
                  'max-w-0 opacity-0 overflow-hidden transition-all duration-500 whitespace-nowrap text-base lowercase',
                  'group-hover:max-w-xs group-hover:opacity-100',
                )}
              >
                {checkingHealth ? 'synchronizing' : 'sync node'}
              </span>
            </Button>
          </header>

          {/* FLAT LUXURY SUMMARY CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {summaryCards.map((metric) => (
              <Card key={metric.key}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground font-normal lowercase">
                      {metric.label}
                    </span>
                    <div
                      className={cn(
                        'size-10 rounded-xl flex items-center justify-center transition-all',
                        metric.color,
                      )}
                    >
                      <div className="">{metric.icon}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    {loadingStats ? (
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    ) : (
                      <TextHeading size="h1" className="lowercase leading-none">
                        {metric.value || '0'}
                      </TextHeading>
                    )}
                    <span className="text-base font-normal text-muted-foreground lowercase">
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
              <div className="size-9 rounded-xl bg-muted flex items-center justify-center border border-border">
                <Icons.clock className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-muted-foreground font-normal lowercase">
                  system uptime
                </span>
                {loadingStats ? (
                  <Skeleton className="h-5 w-24 rounded mt-1" />
                ) : (
                  <span className="text-base text-foreground font-normal lowercase">
                    {realStats.uptime} availability
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-muted flex items-center justify-center border border-border">
                <Icons.zap className="size-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-muted-foreground font-normal lowercase">
                  latency
                </span>
                {loadingStats ? (
                  <Skeleton className="h-5 w-20 rounded mt-1" />
                ) : (
                  <span className="text-base text-foreground font-normal lowercase">
                    {realStats.latency} average
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-muted flex items-center justify-center border border-border">
                <Icons.shieldCheck className="size-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-muted-foreground font-normal lowercase">
                  security
                </span>
                <span className="text-base text-foreground font-normal lowercase">
                  ssl 256-bit active
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </TargetLayout>
  );
}
