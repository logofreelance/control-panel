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

  const { target, loading, handleCheckHealth, checkingHealth, metrics, isOnline, realStats } =
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


  if (!target)
    return (
      <TargetLayout>
        <div className="max-w-2xl mx-auto mt-20 px-6">
          <Alert variant="destructive">
            <div className="flex items-start gap-4">
              <Icons.alertTriangle className="size-6 text-destructive mt-1" />
              <div className="flex flex-col gap-2">
                <AlertTitle className="text-xl font-semibold text-destructive leading-none lowercase">
                  connection failure detected
                </AlertTitle>
                <AlertDescription className="text-base text-destructive font-instrument lowercase">
                  the requested instance node could not be synchronized. this might be due to
                  network latency or an invalid reference key.
                </AlertDescription>
                <Button
                  variant="destructive"
                  className="mt-4 w-fit rounded-xl lowercase"
                  onClick={() => window.location.reload()}
                >
                  <Icons.refresh className="size-4 mr-2" />
                  attempt reconnect
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
        <div className="relative z-10 w-full max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-10 flex flex-col gap-8">
          {/* FLAT LUXURY HEADER */}
          <header className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={handleCheckHealth}
              disabled={checkingHealth}
              className="group h-12 px-4 rounded-xl border-border transition-all text-foreground flex items-center gap-0 hover:gap-2 font-normal"
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
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {summaryCards.map((metric) => (
              <Card key={metric.key}>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <span className="text-base text-muted-foreground font-normal lowercase">
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
                    <TextHeading size="h1" className="lowercase leading-none">
                      {metric.value || '0'}
                    </TextHeading>
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
                <span className="text-base text-foreground font-normal lowercase">
                  {realStats.uptime} availability
                </span>
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
                <span className="text-base text-foreground font-normal lowercase">
                  {realStats.latency} average
                </span>
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
                <span className="text-base text-foreground font-normal lowercase">ssl 256-bit active</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </TargetLayout>
  );
}
