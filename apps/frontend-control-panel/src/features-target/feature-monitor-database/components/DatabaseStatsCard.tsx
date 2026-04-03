'use client';

/**
 * DatabaseStatsCard - Shows database storage statistics
 * Refactored to match standard dashboard design (Flat UI)
 */

import { useMemo } from 'react';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { MonitorDatabaseStats } from '../types';

const L = MODULE_LABELS.monitorDatabase?.labels || {};

interface DatabaseStatsCardProps {
    stats: MonitorDatabaseStats | null;
    loading?: boolean;
}

export const DatabaseStatsCard = ({ stats, loading }: DatabaseStatsCardProps) => {
    const totals = useMemo(() => {
        if (!stats?.tables) return null;
        return stats.tables.reduce((acc, table) => ({
            dataMB: acc.dataMB + parseFloat(table.sizeMb || '0'),
            indexMB: acc.indexMB + parseFloat(table.indexSizeMb || '0'),
            overheadMB: acc.overheadMB + parseFloat(table.overheadMb || '0'),
        }), { dataMB: 0, indexMB: 0, overheadMB: 0 });
    }, [stats]);

    if (loading) return null; // Let parent handle loading or showing skeleton

    if (!stats) return null;

    const totalStorageMB = stats.totalSizeMb;
    const totalRows = stats.totalRows;

    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Total Storage */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.databaseStorage || 'Storage'}</p>
                    <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                        <Icons.database className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                        {totalStorageMB} <span className="text-xs sm:text-sm font-normal text-slate-400">{L.mb || 'MB'}</span>
                    </p>
                    <p className="text-[10px] text-teal-600 font-medium mt-1 truncate">{stats.databaseName}</p>
                </div>
            </div>

            {/* Data Size */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.data || 'Data'}</p>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Icons.fileText className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                        {totals?.dataMB.toFixed(2)} <span className="text-xs sm:text-sm font-normal text-slate-400">{L.mb || 'MB'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Raw Data</p>
                </div>
            </div>

            {/* Index Size */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.index || 'Index'}</p>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                        <Icons.list className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                        {totals?.indexMB.toFixed(2)} <span className="text-xs sm:text-sm font-normal text-slate-400">{L.mb || 'MB'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Indexes</p>
                </div>
            </div>

            {/* Total Rows */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{L.totalRows || 'Total Rows'}</p>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Icons.list className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div>
                    <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                        {totalRows.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Total Records</p>
                </div>
            </div>
        </section>
    );
};
