/* eslint-disable react/jsx-no-literals */
'use client';

/**
 * MonitorView - System Observability Dashboard
 * Enhanced: Cluster Overview + Error Distribution + Top Endpoints + Traffic Chart + API Logs
 */

import { useState } from 'react';
import { 
    LineChart as RechartsLineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { Badge, Button, Input } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useMonitor } from '../composables';
import { useToast } from '@/modules/_core';
import type { ApiLog, TopEndpoint, ErrorDistribution, NodeHealth } from '../types';

const L = MODULE_LABELS.monitor;

// Helper: Format uptime seconds to human readable
const formatUptime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

// Error Distribution Bar Colors
const DIST_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
    '2xx': { bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700' },
    '3xx': { bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700' },
    '4xx': { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' },
    '5xx': { bg: 'bg-red-50', bar: 'bg-red-500', text: 'text-red-700' },
    'other': { bg: 'bg-slate-50', bar: 'bg-slate-400', text: 'text-slate-600' },
};

// Method badge colors  
const methodColors: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-600',
    POST: 'bg-emerald-50 text-emerald-600',
    PUT: 'bg-amber-50 text-amber-600',
    DELETE: 'bg-red-50 text-red-600',
    PATCH: 'bg-purple-50 text-purple-600',
};

// === SUB-COMPONENTS ===

const ClusterStrip = ({ nodes }: { nodes: NodeHealth[] }) => {
    const onlineCount = nodes.filter(n => n.status === 'online').length;
    return (
        <section className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                        <Icons.server className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-900">Cluster Overview</h3>
                        <p className="text-[10px] text-slate-500">{onlineCount} of {nodes.length} nodes online</p>
                    </div>
                </div>
                <Badge variant={onlineCount > 0 ? 'success' : 'danger'}>
                    {onlineCount > 0 ? 'Healthy' : 'No Nodes'}
                </Badge>
            </div>
            {nodes.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs">
                    Belum ada node backend terdeteksi
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {nodes.map(node => (
                        <div key={node.nodeId} className={`flex items-center gap-3 p-3 rounded-lg border ${node.status === 'online' ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${node.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-mono text-slate-700 truncate">{node.endpointUrl}</p>
                                <div className="flex gap-2 mt-1 text-[10px] text-slate-500">
                                    <span>CPU {node.cpuUsage}</span>
                                    <span>RAM {node.memoryUsage}</span>
                                    <span>↑{formatUptime(node.uptime)}</span>
                                </div>
                            </div>
                            <Badge variant={node.status === 'online' ? 'success' : 'danger'} className="shrink-0 text-[9px]">
                                {node.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

const ErrorDistChart = ({ data }: { data: ErrorDistribution[] }) => {
    const totalCount = data.reduce((sum, d) => sum + d.count, 0);
    return (
        <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <Icons.pieChart className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm text-slate-900">Status Distribution</h3>
                    <p className="text-[10px] text-slate-500">7 hari terakhir</p>
                </div>
            </div>
            {data.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada data</p>
            ) : (
                <div className="space-y-2.5">
                    {data.map(item => {
                        const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                        const colors = DIST_COLORS[item.category] || DIST_COLORS['other'];
                        return (
                            <div key={item.category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-semibold ${colors.text}`}>{item.category}</span>
                                    <span className="text-[10px] text-slate-500">{item.count.toLocaleString()} ({pct}%)</span>
                                </div>
                                <div className={`w-full h-2 rounded-full ${colors.bg}`}>
                                    <div className={`h-2 rounded-full ${colors.bar} transition-all`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const TopEndpointsTable = ({ endpoints }: { endpoints: TopEndpoint[] }) => (
    <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Icons.barChart className="w-4 h-4" />
            </div>
            <div>
                <h3 className="font-semibold text-sm text-slate-900">Top Endpoints</h3>
                <p className="text-[10px] text-slate-500">10 endpoint paling sering dipanggil</p>
            </div>
        </div>
        {endpoints.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Belum ada data</p>
        ) : (
            <div className="space-y-2">
                {endpoints.map((ep, idx) => (
                    <div key={`${ep.method}-${ep.endpoint}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 w-4">#{idx + 1}</span>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded shrink-0 ${methodColors[ep.method] || 'bg-slate-100 text-slate-600'}`}>
                            {ep.method}
                        </span>
                        <span className="flex-1 text-xs font-mono text-slate-700 truncate min-w-0">{ep.endpoint}</span>
                        <div className="flex gap-3 shrink-0 text-[10px]">
                            <span className="text-slate-600 font-medium">{ep.totalHits.toLocaleString()} hits</span>
                            <span className="text-slate-400">{ep.avgLatency}ms</span>
                            {ep.errorCount > 0 && (
                                <span className="text-red-500">{ep.errorCount} err</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Mobile-friendly log card component
const LogCard = ({ log, isExpanded, onToggle }: { log: ApiLog; isExpanded: boolean; onToggle: () => void }) => (
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
                        <p className="text-slate-400 text-[10px] mb-1">Endpoint</p>
                        <p className="font-mono text-slate-700 break-all">{log.endpoint}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] mb-1">IP Address</p>
                        <p className="font-mono text-slate-700">{log.ip || '-'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] mb-1">Origin</p>
                        <p className="font-mono text-slate-700 break-all">{log.origin || '-'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] mb-1">Time</p>
                        <p className="font-mono text-slate-700">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-[10px] mb-1">User Agent</p>
                    <p className="font-mono text-[10px] text-slate-600 break-all">{log.userAgent || '-'}</p>
                </div>
            </div>
        )}
    </div>
);

// === MAIN COMPONENT ===

export const MonitorView = () => {
    const { addToast } = useToast();
    const {
        loading,
        total,
        success,
        failed,
        avgLatency,
        traffic,
        topEndpoints,
        errorDistribution,
        clusterNodes,
        recentLogs,
        refresh
    } = useMonitor();

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
        const headers = ['Time', 'Method', 'Endpoint', 'Status', 'Latency (ms)', 'IP', 'Origin', 'User Agent'];
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
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Icons.activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">System Observability</h1>
                        <p className="text-xs sm:text-sm text-slate-500">Real-time cluster monitoring & API analytics</p>
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

            {/* 1. Cluster Overview Strip */}
            <div className="relative">
                {loading && <LoadingOverlay />}
                <ClusterStrip nodes={clusterNodes} />
            </div>

            {/* 2. Stats Grid - 2x2 on mobile */}
            <section className="grid grid-cols-2 gap-3 relative min-h-[150px]">
                {loading && <LoadingOverlay />}
                <div className="bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500">{L.labels.totalRequests}</p>
                        <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Icons.barChart className="w-3 h-3 text-white" />
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

            {/* 3. Error Distribution + Top Endpoints (Side by Side on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                    <ErrorDistChart data={errorDistribution} />
                </div>
                <div className="lg:col-span-3">
                    <TopEndpointsTable endpoints={topEndpoints} />
                </div>
            </div>

            {/* 4. Daily Traffic Chart */}
            <section className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 sm:p-5 relative min-h-[300px] overflow-hidden">
                {loading && <LoadingOverlay />}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Icons.lineChart className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-slate-900">Traffic Analytics</h3>
                            <p className="text-[10px] text-slate-500">Total hit dan rata-rata latensi 30 hari terakhir</p>
                        </div>
                    </div>
                </div>

                {traffic.length === 0 ? (
                    <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                        <Icons.barChart className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-xs">Data statistik lalu-lintas harian belum tersedia</p>
                    </div>
                ) : (
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={traffic} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    width={40}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    width={40}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Line 
                                    yAxisId="left"
                                    name="Total Requests"
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="var(--primary)" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, strokeWidth: 2 }} 
                                    activeDot={{ r: 6 }} 
                                />
                                <Line 
                                    yAxisId="right"
                                    name="Avg Latency (ms)"
                                    type="monotone" 
                                    dataKey="avgLatency" 
                                    stroke="#f59e0b" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, strokeWidth: 2 }} 
                                    activeDot={{ r: 6 }} 
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            {/* 5. Filters */}
            <section className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-3 sm:p-4 space-y-3">
                <div className="relative">
                    <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder={L.labels.searchPlaceholder}
                        className="pl-10 bg-slate-50 border-none focus:bg-white text-sm w-full"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                    <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
                        {['GET', 'POST', 'PUT', 'DEL'].map((method) => {
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

            {/* 6. Logs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900">{L.labels.recentActivity}</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <span className="text-[10px] text-slate-500">
                    {filteredLogs.length} / {recentLogs.length}
                </span>
            </div>

            <section className="space-y-2 relative min-h-[200px]">
                {loading && <LoadingOverlay />}
                {filteredLogs.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-slate-400 shadow-sm shadow-slate-200/50">
                        <Icons.clipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
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
