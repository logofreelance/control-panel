/* eslint-disable react/jsx-no-literals */
'use client';

/**
 * StorageView - Database Inspector
 * Enhanced: Connection Health + Slow Queries + Storage Stats + Table Management
 */

import { useEffect, useState } from 'react';
import { Button, Badge } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useStorageStats } from '../composables';
import { DatabaseStatsCard } from './DatabaseStatsCard';
import { TablesList } from './TablesList';
import type { SlowQuery } from '../types';

const L = MODULE_LABELS.storage;

// Method badge colors  
const methodColors: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-600',
    POST: 'bg-emerald-50 text-emerald-600',
    PUT: 'bg-amber-50 text-amber-600',
    DELETE: 'bg-red-50 text-red-600',
    PATCH: 'bg-purple-50 text-purple-600',
};

export const StorageView = () => {
    const { stats, healthCheck, slowQueries, loading, dropping, refresh, dropTable, cleanupOrphaned } = useStorageStats();
    const [cleaning, setCleaning] = useState(false);

    const handleCleanup = async () => {
        setCleaning(true);
        await cleanupOrphaned();
        setCleaning(false);
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, [refresh]);

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    // Ping health color
    const getPingColor = (ms: number) => {
        if (ms < 100) return 'text-emerald-600';
        if (ms < 500) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4 sm:space-y-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                        <Icons.database className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Database Inspector</h1>
                        <p className="text-xs sm:text-sm text-slate-500">Connection health, storage analytics & table management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {stats?.databaseName !== '...' && (
                        <div className="hidden sm:flex px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium items-center gap-1.5 mr-2">
                            <Icons.checkCircle className="w-3.5 h-3.5" />
                            <span className="max-w-[100px] truncate">{stats?.databaseName}</span>
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleCleanup} disabled={loading || cleaning} className="gap-2 text-xs">
                        <Icons.trash className={`w-3.5 h-3.5 ${cleaning ? 'animate-pulse' : ''}`} />
                        <span className="hidden sm:inline">{cleaning ? 'Cleaning...' : L.buttons.cleanup}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2 text-xs">
                        <Icons.refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{L.buttons.refresh}</span>
                    </Button>
                </div>
            </div>

            {/* Connection Health Card */}
            <section className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 sm:p-5 relative">
                {loading && !healthCheck && <LoadingOverlay />}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Icons.activity className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-slate-900">Connection Health</h3>
                            <p className="text-[10px] text-slate-500">TiDB Cloud diagnostics</p>
                        </div>
                    </div>
                    {healthCheck && (
                        <Badge variant={healthCheck.healthy ? 'success' : 'danger'}>
                            {healthCheck.healthy ? 'Healthy' : 'Unhealthy'}
                        </Badge>
                    )}
                </div>
                {healthCheck ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50">
                            <p className="text-[10px] text-slate-500 mb-1">Ping</p>
                            <p className={`text-lg font-semibold ${getPingColor(healthCheck.pingMs)}`}>
                                {healthCheck.pingMs}<span className="text-xs font-normal ml-0.5">ms</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50">
                            <p className="text-[10px] text-slate-500 mb-1">Version</p>
                            <p className="text-xs font-mono text-slate-700 truncate" title={healthCheck.version}>
                                {healthCheck.version.split('-')[0]}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50">
                            <p className="text-[10px] text-slate-500 mb-1">API Logs</p>
                            <p className="text-lg font-semibold text-slate-900">{healthCheck.totalLogs.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50">
                            <p className="text-[10px] text-slate-500 mb-1">Backend Nodes</p>
                            <p className="text-lg font-semibold text-slate-900">{healthCheck.totalNodes}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 col-span-2 sm:col-span-1">
                            <p className="text-[10px] text-slate-500 mb-1">Status</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${healthCheck.healthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                                <span className="text-xs font-medium text-slate-700">{healthCheck.healthy ? 'Connected' : 'Error'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">
                        Memuat diagnostik koneksi...
                    </div>
                )}
            </section>

            {/* Main Stats (Storage, Data, Index, Rows) */}
            <div className="relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                <DatabaseStatsCard stats={stats} loading={false} />
            </div>

            {/* Secondary Insights Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                {/* Active Tables */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.labels.tables}</p>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Icons.table className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{stats?.totalTables ?? 0}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{L.labels.active}</p>
                    </div>
                </div>

                {/* Largest Table */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.labels.largestTable}</p>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Icons.barChart className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 truncate" title={stats?.summary?.largestTable?.name}>
                            {stats?.summary?.largestTable?.name || L.labels.na}
                        </p>
                        <p className="text-[10px] text-blue-600 font-medium mt-1">
                            {stats?.summary?.largestTable?.sizeMb || 0} {L.labels.mb}
                        </p>
                    </div>
                </div>

                {/* Most Rows */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.labels.mostRows}</p>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Icons.barChart className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 truncate" title={stats?.summary?.mostRowsTable?.name}>
                            {stats?.summary?.mostRowsTable?.name || L.labels.na}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">
                            {(stats?.summary?.mostRowsTable?.rows ?? 0).toLocaleString()} {L.labels.rows}
                        </p>
                    </div>
                </div>

                {/* Index Ratio */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.labels.indexRatio}</p>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                            <Icons.pieChart className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                            {stats?.summary?.indexRatio || '0'}{L.labels.percent}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{L.labels.indexData}</p>
                    </div>
                </div>
            </section>

            {/* Slow Queries Section */}
            <section className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <Icons.zap className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-900">Slow Requests</h3>
                        <p className="text-[10px] text-slate-500">10 request paling lambat (7 hari terakhir)</p>
                    </div>
                </div>
                {slowQueries.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                        <Icons.zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">Belum ada data request log</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {slowQueries.map((sq: SlowQuery, idx: number) => (
                            <div key={`${sq.endpoint}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="text-[10px] font-bold text-slate-400 w-4">#{idx + 1}</span>
                                <span className={`text-[9px] font-medium px-2 py-0.5 rounded shrink-0 ${methodColors[sq.method] || 'bg-slate-100 text-slate-600'}`}>
                                    {sq.method}
                                </span>
                                <span className="flex-1 text-xs font-mono text-slate-700 truncate min-w-0">{sq.endpoint}</span>
                                <Badge variant={sq.statusCode < 400 ? 'success' : sq.statusCode < 500 ? 'warning' : 'danger'} className="shrink-0 text-[9px]">
                                    {sq.statusCode}
                                </Badge>
                                <span className={`text-xs font-semibold shrink-0 ${sq.durationMs > 1000 ? 'text-red-500' : sq.durationMs > 300 ? 'text-amber-500' : 'text-slate-600'}`}>
                                    {sq.durationMs}ms
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Tables List */}
            <div className="relative min-h-[200px]">
                {loading && <LoadingOverlay />}
                <TablesList tables={stats?.tables || []} loading={false} dropping={dropping} onDelete={dropTable} />
            </div>
        </div>
    );
};
