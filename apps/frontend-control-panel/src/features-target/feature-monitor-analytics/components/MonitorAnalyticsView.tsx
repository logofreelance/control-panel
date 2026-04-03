'use client';

/**
 * MonitorAnalyticsView - API Monitoring & Analytics Dashboard
 */

import { useState } from 'react';
import { Badge, Button, Input } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useMonitorAnalytics } from '../composables/useMonitorAnalytics';
import { useToast } from '@/modules/_core';
import type { ApiLog } from '../types';

const L = MODULE_LABELS.monitorAnalytics;

// Mobile-friendly log card component
const LogCard = ({ log, isExpanded, onToggle }: { log: ApiLog; isExpanded: boolean; onToggle: () => void }) => {
    const methodColors: Record<string, string> = {
        GET: 'bg-blue-50 text-blue-600',
        POST: 'bg-emerald-50 text-emerald-600',
        PUT: 'bg-amber-50 text-amber-600',
        DELETE: 'bg-red-50 text-red-600',
        PATCH: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden">
            <div
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={onToggle}
            >
                <Badge variant={log.statusCode < 400 ? 'success' : log.statusCode < 500 ? 'warning' : 'danger'}>
                    {log.statusCode}
                </Badge>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded shrink-0 ${methodColors[log.method] || 'bg-slate-100 text-slate-600'}`}>
                    {log.method}
                </span>
                <span className="flex-1 text-xs font-mono text-slate-700 truncate min-w-0">{log.endpoint}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{log.durationMs}ms</span>
                <Icons.chevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-50 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="text-slate-400 text-[10px] mb-1">{L.labels.endpoint}</p>
                            <p className="font-mono text-slate-700 break-all">{log.endpoint}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] mb-1">{L.labels.ip}</p>
                            <p className="font-mono text-slate-700">{log.ip || '-'}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] mb-1">{L.labels.origin}</p>
                            <p className="font-mono text-slate-700 break-all">{log.origin || '-'}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] mb-1">{L.labels.time}</p>
                            <p className="font-mono text-slate-700">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] mb-1">{L.labels.userAgent}</p>
                        <p className="font-mono text-[10px] text-slate-600 break-all">{log.userAgent || '-'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MonitorAnalyticsView = () => {
    const { addToast } = useToast();
    const {
        loading,
        total,
        success,
        failed,
        avgLatency,
        recentLogs,
        refresh
    } = useMonitorAnalytics();

    const [searchQuery, setSearchQuery] = useState('');
    const [methodFilter, setMethodFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | '2xx' | '4xx' | '5xx'>('all');
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

    const filteredLogs = recentLogs.filter((log: ApiLog) => {
        if (searchQuery && !log.endpoint.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (methodFilter && log.method !== methodFilter) return false;
        if (statusFilter === '2xx' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
        if (statusFilter === '4xx' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
        if (statusFilter === '5xx' && log.statusCode < 500) return false;
        return true;
    });

    const handleExportCsv = () => {
        const headers = [L.labels.time, L.labels.method, L.labels.endpoint, L.labels.status, L.labels.latency, L.labels.ip, L.labels.origin, L.labels.userAgent];
        const rows = filteredLogs.map((log: ApiLog) => [
            new Date(log.createdAt).toISOString(),
            log.method,
            log.endpoint,
            log.statusCode,
            log.durationMs,
            log.ip || '',
            log.origin || '',
            log.userAgent || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(L.messages.exported, 'success');
    };

    const clearFilters = () => {
        setSearchQuery('');
        setMethodFilter(null);
        setStatusFilter('all');
    };

    const hasFilters = searchQuery || methodFilter || statusFilter !== 'all';

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-(--primary) border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Icons.monitor className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">{L.title}</h1>
                        <p className="text-xs sm:text-sm text-slate-500">{L.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg shadow-sm shadow-slate-200/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-medium text-slate-500">{L.labels.liveStatus}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { refresh(); addToast(L.messages.refreshed, 'success'); }}>
                        <Icons.refresh className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Stats Grid - 2x2 on mobile */}
            <section className="grid grid-cols-2 gap-3 relative min-h-[150px]">
                {loading && <LoadingOverlay />}
                <div className="bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500">{L.labels.totalRequests}</p>
                        <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Icons.stats className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{total.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500">{L.labels.successful}</p>
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Icons.checkCircle className="w-3 h-3" />
                        </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-emerald-600">{success.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500">{L.labels.failed}</p>
                        <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                            <Icons.close className="w-3 h-3" />
                        </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-red-500">{failed.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500">{L.labels.avgLatency}</p>
                        <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <Icons.zap className="w-3 h-3" />
                        </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                        {avgLatency}<span className="text-xs text-slate-400 font-normal ml-0.5">{L.labels.ms}</span>
                    </p>
                </div>
            </section>

            {/* Filters - Stacked on mobile, inline on desktop */}
            <section className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-3 sm:p-4 space-y-3">
                {/* Search */}
                <div className="relative">
                    <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder={L.labels.searchPlaceholder}
                        className="pl-10 bg-slate-50 border-none focus:bg-white text-sm w-full"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter buttons - scrollable on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                    <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
                        {['GET', 'POST', 'PUT', 'DEL'].map((method, i) => {
                            const fullMethod = method === 'DEL' ? 'DELETE' : method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => setMethodFilter(methodFilter === fullMethod ? null : fullMethod)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all shrink-0 ${methodFilter === fullMethod
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {method}
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                    <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: '2xx', label: '2xx' },
                            { key: '4xx', label: '4xx' },
                            { key: '5xx', label: '5xx' },
                        ].map(s => (
                            <button
                                key={s.key}
                                onClick={() => setStatusFilter(s.key as typeof statusFilter)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all shrink-0 ${statusFilter === s.key
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 sm:ml-auto">
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                                <Icons.close className="w-3 h-3" />
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
                            <Icons.download className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">{L.labels.exportCsv}</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Logs Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900">{L.labels.recentActivity}</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <span className="text-[10px] text-slate-500">
                    {filteredLogs.length} / {recentLogs.length}
                </span>
            </div>

            {/* Logs List - Cards for all screen sizes */}
            <section className="space-y-2 relative min-h-[200px]">
                {loading && <LoadingOverlay />}
                {filteredLogs.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-slate-400 shadow-sm shadow-slate-200/50">
                        <Icons.document className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">{L.labels.noLogs}</p>
                    </div>
                ) : (
                    filteredLogs.map((log: ApiLog) => (
                        <LogCard
                            key={log.id}
                            log={log}
                            isExpanded={expandedLogId === log.id}
                            onToggle={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        />
                    ))
                )}
            </section>
        </div>
    );
};
