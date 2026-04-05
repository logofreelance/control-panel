'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useMonitorAnalytics } from '../composables/useMonitorAnalytics';
import { useToast } from '@/modules/_core';
import type { ApiLog } from '../types';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';

const L = MODULE_LABELS.monitorAnalytics;

export const MonitorAnalyticsView = () => {
  const { addToast } = useToast();
  const { loading, total, success, failed, avgLatency, recentLogs, refresh } =
    useMonitorAnalytics();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | '2xx' | '4xx' | '5xx'>('all');

  const filteredLogs = recentLogs.filter((log: ApiLog) => {
    if (searchQuery && !log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    if (methodFilter && log.method !== methodFilter) return false;
    if (statusFilter === '2xx' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
    if (statusFilter === '4xx' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
    if (statusFilter === '5xx' && log.statusCode < 500) return false;
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      L.labels.time,
      L.labels.method,
      L.labels.endpoint,
      L.labels.status,
      L.labels.latency,
      L.labels.ip,
      L.labels.origin,
      L.labels.userAgent,
    ];
    const rows = filteredLogs.map((log: ApiLog) => [
      new Date(log.createdAt).toISOString(),
      log.method,
      log.endpoint,
      log.statusCode,
      log.durationMs,
      log.ip || '',
      log.origin || '',
      log.userAgent || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
      '\n',
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(L.messages.exported.toLowerCase(), 'success');
  };

  const metrics = [
    {
      id: 'total',
      label: L.labels.totalRequests.toLowerCase(),
      value: total.toLocaleString(),
      icon: Icons.activity,
      color: 'text-chart-1',
    },
    {
      id: 'success',
      label: L.labels.successful.toLowerCase(),
      value: success.toLocaleString(),
      icon: Icons.checkCircle,
      color: 'text-chart-2',
    },
    {
      id: 'failed',
      label: L.labels.failed.toLowerCase(),
      value: failed.toLocaleString(),
      icon: Icons.alertTriangle,
      color: 'text-destructive',
    },
    {
      id: 'latency',
      label: L.labels.avgLatency.toLowerCase(),
      value: `${avgLatency}${L.labels.ms.toLowerCase()}`,
      icon: Icons.zap,
      color: 'text-chart-3',
    },
  ];
  return (
    <TargetLayout>
      <div className="relative w-full min-h-screen bg-background font-instrument overflow-x-hidden pb-10 sm:pb-20">
        <main className="relative z-10 w-full max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-10 flex flex-col gap-10 md:gap-14 animate-spring">
          {/* BOLD COLOR HEADER - CLEAN TYPO */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <TextHeading as="h1" size="h3">
                {L.title}
              </TextHeading>
              <span className="text-sm md:text-lg text-muted-foreground/40 font-normal lowercase tracking-normal">
                real-time engine analytics
              </span>
            </div>

            <Button
              variant="default"
              onClick={() => {
                refresh();
                addToast(L.messages.refreshed.toLowerCase(), 'success');
              }}
              disabled={loading}
              className="group rounded-full size-10 p-0 flex items-center justify-center gap-0 transition-all duration-500 ease-in-out active:scale-95 md:hover:w-44 md:hover:px-1 md:hover:gap-3 overflow-hidden"
            >
              <Icons.refresh className={cn('size-4', loading && 'animate-spin')} />
              <span className="max-w-0 opacity-0 overflow-hidden transition-all duration-500 whitespace-nowrap lowercase md:group-hover:max-w-xs group-hover:max-w-0 md:group-hover:opacity-100">
                {loading ? 'synchronizing' : 'sync data'}
              </span>
            </Button>
          </header>

          {/* METRICS GRID - VIBRANT COLORS - NORMAL TYPO */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {metrics.map((m) => (
              <Card
                key={m.id}
                className={cn(
                  'group relative bg-card border-2 rounded-3xl overflow-hidden shadow-none transition-all duration-300 opacity-100',
                  m.id === 'total' && 'border-chart-1/30 hover:border-chart-1/100',
                  m.id === 'success' && 'border-chart-2/30 hover:border-chart-2/100',
                  m.id === 'failed' && 'border-destructive/30 hover:border-destructive/100',
                  m.id === 'latency' && 'border-chart-3/30 hover:border-chart-3/100',
                )}
              >
                {/* BOLD SILHOUETTE */}
                <div
                  className={cn(
                    'absolute -right-6 -bottom-6 size-24 sm:size-32 transition-transform group-hover:scale-110 opacity-5 blur-2xl',
                    m.color,
                  )}
                >
                  <m.icon className="size-full rotate-12" />
                </div>

                <CardContent className="relative px-4 py-2 sm:px-5 sm:py-3 flex flex-col gap-2.5 sm:gap-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm md:text-base font-normal text-muted-foreground/40 lowercase tracking-normal leading-none">
                      {m.label}
                    </span>
                    <div
                      className={cn(
                        'size-8 sm:size-10 rounded-xl flex items-center justify-center transition-transform group-hover:-rotate-6 bg-background border border-border/5',
                        m.color,
                      )}
                    >
                      <m.icon className="size-4 sm:size-5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextHeading
                      as="p"
                      size="h1"
                      className="text-4xl sm:text-5xl font-medium tracking-normal leading-none text-foreground"
                    >
                      {loading ? <Skeleton className="h-10 w-20" /> : m.value}
                    </TextHeading>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn('size-1.5 rounded-full', m.color.replace('text-', 'bg-'))}
                      />
                      <span className="text-sm md:text-base font-normal text-muted-foreground/30 lowercase tracking-normal">
                        live data ({total.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* ACTIVITY LOGS SECTION - BOLD CONTRAST HEADER */}
          <div className="flex flex-col gap-8 px-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 px-1">
                <TextHeading
                  as="h2"
                  size="h3"
                  weight="medium"
                  className="lowercase text-xl sm:text-2xl text-foreground tracking-normal"
                >
                  request logs
                </TextHeading>
                <span className="text-[10px] sm:text-xs text-muted-foreground/30 font-normal lowercase tracking-normal bg-muted/20 px-2 py-0.5 rounded-lg border border-border/5">
                  {filteredLogs.length}/{recentLogs.length}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="relative flex-1 w-full flex items-center h-12 p-1 bg-muted/40 border border-border/40 rounded-2xl overflow-hidden focus-within:border-primary/50 transition-all">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icons.search className="size-4 text-muted-foreground/50" />
                  </div>

                  <Input
                    placeholder="search by endpoint..."
                    className="flex-1 pl-11 pr-32 sm:pr-40 h-full bg-transparent border-none focus-visible:ring-0 text-sm sm:text-base placeholder:text-muted-foreground/50 text-foreground lowercase tracking-normal font-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="absolute right-1 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-10 px-3 rounded-xl text-sm sm:text-base font-normal lowercase transition-all bg-background border border-border/40 text-foreground flex items-center gap-2 hover:bg-muted/20 active:scale-95 cursor-pointer outline-none shadow-none">
                        <Icons.filter
                          className={cn(
                            'size-3.5 sm:size-4 text-muted-foreground',
                            methodFilter && 'text-primary',
                          )}
                        />
                        <span className="hidden sm:inline">
                          {methodFilter ? methodFilter.toLowerCase() : 'all methods'}
                        </span>
                        <span className="sm:hidden">
                          {methodFilter ? methodFilter.toLowerCase() : 'all'}
                        </span>
                        <Icons.chevronDown className="size-3 opacity-20" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-2xl border border-border/10 bg-background/95 backdrop-blur-xl shadow-none p-1.5 flex flex-col gap-0.5"
                      >
                        <DropdownMenuRadioGroup
                          value={methodFilter || 'ALL'}
                          onValueChange={(v: string) => setMethodFilter(v === 'ALL' ? null : v)}
                        >
                          {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                            <DropdownMenuRadioItem
                              key={m}
                              value={m}
                              className="rounded-xl px-4 py-2.5 text-sm lowercase font-normal focus:bg-muted/50 transition-colors cursor-pointer data-checked:bg-primary/10 data-checked:text-primary"
                            >
                              {m === 'DELETE' ? 'del' : m.toLowerCase()}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE - VIBRANT STATUS - CLEAN TYPO */}
            <Card className="border border-border/10 rounded-[2.5rem] overflow-hidden bg-card shadow-none opacity-100">
              <div className="overflow-x-auto scrollbar-hide">
                <Table className="w-full">
                  <TableHeader className="bg-muted/10 border-b border-border/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="h-14 px-3 sm:px-8 text-left text-[11px] font-normal lowercase text-muted-foreground/40">
                        status
                      </TableHead>
                      <TableHead className="h-14 px-2 sm:px-4 text-center text-[11px] font-normal lowercase text-muted-foreground/40">
                        method
                      </TableHead>
                      <TableHead className="h-14 px-6 text-left text-[11px] font-normal lowercase text-muted-foreground/40">
                        endpoint
                      </TableHead>
                      <TableHead className="h-14 px-6 text-right text-[11px] font-normal lowercase text-muted-foreground/40 hidden md:table-cell">
                        latency
                      </TableHead>
                      <TableHead className="h-14 px-8 text-right text-[11px] font-normal lowercase text-muted-foreground/40 hidden md:table-cell">
                        time
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-border/5">
                          <TableCell className="h-16 px-8">
                            <Skeleton className="h-4 w-12 rounded-lg" />
                          </TableCell>
                          <TableCell className="h-16 text-center">
                            <Skeleton className="h-6 w-16 mx-auto rounded-lg" />
                          </TableCell>
                          <TableCell className="h-16 px-6">
                            <Skeleton className="h-4 w-full max-w-[200px] rounded-lg" />
                          </TableCell>
                          <TableCell className="h-16 text-right px-6 hidden md:table-cell">
                            <Skeleton className="h-4 w-12 ml-auto rounded-lg" />
                          </TableCell>
                          <TableCell className="h-16 text-right px-8 hidden md:table-cell">
                            <Skeleton className="h-4 w-20 ml-auto rounded-lg" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-40 text-center text-muted-foreground/40 font-normal lowercase italic-none"
                        >
                          no matching engine logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log: ApiLog, i) => (
                        <TableRow
                          key={i}
                          className="group border-border/5 hover:bg-muted/10 transition-all font-instrument"
                        >
                          <TableCell className="px-3 sm:px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  'size-2 rounded-full',
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? 'bg-chart-2 shadow-[0_0_12px_var(--chart-2)]'
                                    : 'bg-destructive shadow-[0_0_12px_var(--destructive)]',
                                )}
                              />
                              <span
                                className={cn(
                                  'text-base font-semibold tracking-tight leading-none',
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? 'text-foreground'
                                    : 'text-destructive',
                                )}
                              >
                                {log.statusCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-1 sm:px-3 py-5">
                            <Badge
                              className={cn(
                                'h-7 px-3 rounded-full border-none font-semibold text-xs lowercase transition-colors',
                                log.method === 'GET'
                                  ? 'bg-chart-1/10 text-chart-1'
                                  : log.method === 'POST'
                                    ? 'bg-chart-2/10 text-chart-2'
                                    : log.method === 'PUT'
                                      ? 'bg-chart-3/10 text-chart-3'
                                      : 'bg-destructive/10 text-destructive',
                              )}
                            >
                              {log.method.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-5 font-normal text-base text-foreground/90 lowercase tracking-normal">
                            <div className="flex flex-col gap-1.5">
                              <span className="break-all sm:break-normal">
                                {log.endpoint || '/'}
                              </span>
                              <div className="flex md:hidden items-center gap-3 text-[11px] text-muted-foreground/30 font-normal">
                                <span>{log.durationMs}ms</span>
                                <span className="size-1 rounded-full bg-border/50" />
                                <span>
                                  {new Date(log.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false,
                                  })}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right hidden md:table-cell">
                            <span className="text-sm font-medium text-foreground">
                              {log.durationMs}
                              <span className="text-[10px] text-muted-foreground/30 font-normal ml-1 lowercase">
                                ms
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="px-8 py-5 text-right whitespace-nowrap hidden md:table-cell">
                            <span className="text-sm font-normal text-muted-foreground/30 lowercase">
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </TargetLayout>
  );
};
