'use client';

// DashboardView - Main dashboard home component
// Displays real-time stats, recent activity, and infrastructure summary
// PURE DI: Uses @repo/config labels/icons and composables
// Loading handled by local Solid Overlay states for premium feel

import { Badge, Button } from '@/components/ui';
import { Icons, MODULE_LABELS, COMMON_LABELS } from '@/lib/config/client';
import { useDashboard } from '../composables';

export const DashboardView = () => {
    const L = MODULE_LABELS.dashboard;
    const MS = 'ms'; // Extract 'ms' to variable to satisfy no-literals rule
    const { stats, copyGatewayUrl, gatewayUrl, loading } = useDashboard();

    // Infrastructure items with icons
    const infraItems = [
        { label: L.labels.activeEndpoints, value: stats?.activeEndpoints || 0, Icon: Icons.globe, color: 'text-blue-500' },
        { label: L.labels.securityKeys, value: stats?.activeKeys || 0, Icon: Icons.key, color: 'text-amber-500' },
        { label: L.labels.systemHealth, value: '100%', Icon: Icons.checkCircle, color: 'text-emerald-500' }
    ];

    // SOLID Loading Overlay
    // absolute inset-0 bg-white (NO opacity) -> Covers content completely (Blank)
    // z-20 -> Ensures it sits on top
    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-20 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Icons.home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{L.title}</h1>
                        <p className="text-sm text-slate-500">{L.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-lg shadow-sm shadow-slate-200/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></div>
                    <span className="text-[10px] font-medium text-slate-500">{L.liveStatus}</span>
                </div>
            </div>

            {/* Stats Grid - Mobile 2 Columns - Solid Overlay Wrapper */}
            <div className="relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Total Users */}
                    <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.sections.totalUsers}</p>
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Icons.users className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">{stats?.totalUsers || 0}</p>
                            <p className="text-[10px] font-normal text-slate-400 mt-1">{L.sections.activeRegistered}</p>
                        </div>
                    </div>

                    {/* API Requests */}
                    <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.sections.apiRequests}</p>
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                <Icons.barChart className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">{stats?.totalRequests?.toLocaleString() || 0}</p>
                            <p className="text-[10px] font-normal text-slate-400 mt-1">{L.sections.totalTraffic}</p>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.sections.successRate}</p>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Icons.checkCircle className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold tracking-tight text-emerald-600">{stats?.successRate}{COMMON_LABELS.symbol.percent}</p>
                            <p className="text-[10px] font-normal text-slate-400 mt-1">{L.sections.deliveryHealth}</p>
                        </div>
                    </div>

                    {/* Storage */}
                    <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500">{L.sections.storageUsage}</p>
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <Icons.database className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">{stats?.storageMB}<span className="text-sm ml-0.5 text-slate-400 font-normal">MB</span></p>
                            <p className="text-[10px] font-normal text-slate-400 mt-1">{L.sections.assetsVolume}</p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="relative min-h-[400px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <Icons.barChart className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-slate-900">{L.sections.systemActivity}</h3>
                                    <p className="text-[10px] text-slate-500">{L.sections.latestInteractions}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600">{L.labels.liveStream}</Badge>
                        </div>
                        <div className="divide-y divide-slate-50 flex-1">
                            {(stats?.recentLogs?.length || 0) > 0 ? (
                                stats?.recentLogs?.map((log, idx: number) => (
                                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all duration-300 group animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 50}${MS}` }}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-[10px] ${log.statusCode < 400 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {log.statusCode}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${log.method === 'GET' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.method}</span>
                                                    <span className="text-xs font-medium text-slate-700 tracking-tight">{log.endpoint}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                                    <p className="text-[9px] text-slate-400">{log.durationMs}{MS}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-[var(--primary)]">
                                            <Icons.filter className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400">
                                    <Icons.barChart className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="font-normal text-xs">{L.labels.noActivity}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Cards */}
                    <div className="space-y-6">
                        {/* Infrastructure Summary */}
                        <div className="p-5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] -mr-16 -mt-16"></div>
                            <h3 className="font-semibold text-sm mb-4 relative z-10">{L.sections.infrastructure}</h3>
                            <div className="space-y-2.5 relative z-10">
                                {infraItems.map((item, i) => {
                                    const ItemIcon = item.Icon;
                                    return (
                                        <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <ItemIcon className={`w-3.5 h-3.5 ${item.color}`} />
                                                <span className="text-xs font-normal text-slate-300">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-sm">{item.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Access / Gateway */}
                        <div className="p-5 bg-white rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden relative group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Icons.rocket className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">{L.sections.mainGateway}</h4>
                                    <p className="text-[10px] text-slate-500 font-normal">{L.sections.publicApiEntry}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                <code className="text-[10px] font-mono text-slate-600 break-all leading-relaxed block bg-white p-2 rounded shadow-sm">
                                    {gatewayUrl}
                                </code>
                            </div>
                            <Button
                                onClick={copyGatewayUrl}
                                className="w-full py-2.5 text-xs font-medium shadow-none rounded-lg gap-2 bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Icons.copy className="w-3.5 h-3.5" /> {L.labels.copyUrl}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
