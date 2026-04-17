'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Card,
  CardContent,
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
  const [visibleCount, setVisibleCount] = useState(5);

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
      color: 'text-primary',
    },
    {
      id: 'success',
      label: L.labels.successful.toLowerCase(),
      value: success.toLocaleString(),
      icon: Icons.checkCircle,
      color: 'text-primary',
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
      color: 'text-primary',
    },
  ];
  return (
    <TargetLayout>
      <div className="relative w-full min-h-screen bg-background font-instrument overflow-x-hidden">
        <main className="relative z-10 w-full flex flex-col gap-6 md:gap-8">
          {/* BOLD COLOR HEADER - CLEAN TYPO */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <TextHeading as="h1" size="h3">
                {L.title}
              </TextHeading>
              <span className="text-base text-muted-foreground font-normal lowercase">
                real-time engine analytics
              </span>
            </div>

            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                refresh();
                addToast(L.messages.refreshed.toLowerCase(), 'success');
              }}
              disabled={loading}
              className="shadow-none"
            >
              <Icons.refresh className={cn('size-4', loading && 'animate-spin')} />
            </Button>
          </header>

          {/* METRICS GRID - VIBRANT COLORS - NORMAL TYPO */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <Card key={m.id}>
                <CardContent className="relative flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-base font-normal text-muted-foreground lowercase leading-none">
                      {m.label}
                    </span>
                    <div className="size-10 rounded-xl flex items-center justify-center bg-muted text-primary">
                      <m.icon className="size-5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextHeading size="h3" className="leading-none">
                      {loading ? '...' : m.value}
                    </TextHeading>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-normal text-muted-foreground lowercase">
                        live data ({total.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* ACTIVITY LOGS SECTION - BOLD CONTRAST HEADER */}
          <div className="flex flex-col gap-6 px-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 px-1">
                <TextHeading as="h2" size="h4" className="lowercase text-foreground">
                  request logs
                </TextHeading>
                <span className="text-base text-muted-foreground font-normal lowercase bg-muted py-0.5 px-2 rounded-lg border border-border">
                  {filteredLogs.length}/{recentLogs.length}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
                <div className="relative w-full flex items-center h-12 p-1 bg-muted border border-border rounded-xl overflow-hidden focus-within:border-primary transition-all">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icons.search className="size-4 text-muted-foreground" />
                  </div>

                  <input
                    placeholder="search by endpoint..."
                    className="flex-1 pl-11 pr-32 sm:pr-40 h-full bg-transparent border-none focus-visible:outline-none text-base placeholder:text-muted-foreground text-foreground lowercase font-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="absolute right-1 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-10 px-3 rounded-lg text-base font-normal lowercase transition-all bg-background border border-border text-foreground flex items-center gap-2 hover:bg-muted active:scale-95 cursor-pointer outline-none">
                        <Icons.filter
                          className={cn(
                            'size-4 text-muted-foreground',
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
                        className="w-56 rounded-xl border border-border bg-background shadow-none p-1.5 flex flex-col gap-0.5"
                      >
                        <DropdownMenuRadioGroup
                          value={methodFilter || 'ALL'}
                          onValueChange={(v: string) => setMethodFilter(v === 'ALL' ? null : v)}
                        >
                          {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                            <DropdownMenuRadioItem
                              key={m}
                              value={m}
                              className="rounded-lg px-4 py-2.5 text-base lowercase font-normal focus:bg-muted transition-colors cursor-pointer"
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
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-muted border-b border-border">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-12 px-3 sm:px-8 text-left text-base font-normal lowercase text-muted-foreground">
                      status
                    </TableHead>
                    <TableHead className="h-12 px-2 sm:px-4 text-center text-base font-normal lowercase text-muted-foreground">
                      method
                    </TableHead>
                    <TableHead className="h-12 px-6 text-left text-base font-normal lowercase text-muted-foreground">
                      endpoint
                    </TableHead>
                    <TableHead className="h-12 px-6 text-right text-base font-normal lowercase text-muted-foreground hidden md:table-cell">
                      latency
                    </TableHead>
                    <TableHead className="h-12 px-8 text-right text-base font-normal lowercase text-muted-foreground hidden md:table-cell">
                      time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="h-40 text-center">
                        <div className="flex items-center justify-center">
                          <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center text-muted-foreground font-normal lowercase"
                      >
                        no matching engine logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredLogs.slice(0, visibleCount).map((log: ApiLog, i) => (
                        <TableRow
                          key={i}
                          className="group border-border hover:bg-muted transition-all font-instrument"
                        >
                          <TableCell className="px-3 sm:px-8 py-2.5">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  'size-2 rounded-full',
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? 'bg-primary'
                                    : 'bg-destructive',
                                )}
                              />
                              <span
                                className={cn(
                                  'text-base font-semibold leading-none',
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? 'text-foreground'
                                    : 'text-destructive',
                                )}
                              >
                                {log.statusCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-1 sm:px-3 py-2.5">
                            <Badge
                              variant={
                                log.method === 'GET'
                                  ? 'secondary'
                                  : log.method === 'DELETE'
                                    ? 'destructive'
                                    : 'default'
                              }
                              className="rounded-full font-normal text-base lowercase"
                            >
                              {log.method.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-2.5 font-normal text-base text-foreground lowercase">
                            <div className="flex flex-col gap-1.5">
                              <span className="break-all sm:break-normal">
                                {log.endpoint || '/'}
                              </span>
                              <div className="flex md:hidden items-center gap-3 text-base text-muted-foreground font-normal">
                                <span>{log.durationMs}ms</span>
                                <span className="size-1 rounded-full bg-border" />
                                <span>
                                  {log.createdAt && !isNaN(new Date(log.createdAt).getTime())
                                    ? new Date(log.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false,
                                      })
                                    : '--:--:--'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-2.5 text-right hidden md:table-cell">
                            <span className="text-base font-normal text-foreground">
                              {log.durationMs}ms
                            </span>
                          </TableCell>
                          <TableCell className="px-8 py-2.5 text-right whitespace-nowrap hidden md:table-cell">
                            <span className="text-base font-normal text-muted-foreground lowercase">
                              {log.createdAt && !isNaN(new Date(log.createdAt).getTime())
                                ? new Date(log.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false,
                                  })
                                : '--:--:--'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length > visibleCount && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="group flex flex-col items-center gap-1 hover:bg-transparent h-auto py-4"
                >
                  <span className="text-base text-muted-foreground lowercase">show more logs</span>
                  <Icons.chevronDown className="size-4 text-muted-foreground transition-all duration-300 group-hover:translate-y-1" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </TargetLayout>
  );
};
