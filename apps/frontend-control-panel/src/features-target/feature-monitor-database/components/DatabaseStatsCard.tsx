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

    if (loading || !stats) return null;

    const totalStorageMB = stats.totalSizeMb;
    const totalRows = stats.totalRows;

    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Total Storage */}
            <div className="bg-card rounded-2xl p-6 border-none shadow-none transition-all hover:bg-muted/5">
                <div className="flex justify-between items-start mb-5">
                    <p className="text-sm font-normal text-muted-foreground lowercase">{L.databaseStorage || 'storage'}</p>
                    <div className="size-8 rounded-xl bg-chart-1/10 flex items-center justify-center text-chart-1">
                        <Icons.database className="size-4" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground lowercase">
                        {totalStorageMB} <span className="text-base font-normal text-muted-foreground">{L.mb || 'mb'}</span>
                    </p>
                    <p className="text-base text-chart-1 font-medium truncate lowercase">{stats.databaseName}</p>
                </div>
            </div>

            {/* Data Size */}
            <div className="bg-card rounded-2xl p-6 border-none shadow-none transition-all hover:bg-muted/5">
                <div className="flex justify-between items-start mb-5">
                    <p className="text-sm font-normal text-muted-foreground lowercase">{L.data || 'data'}</p>
                    <div className="size-8 rounded-xl bg-chart-2/10 flex items-center justify-center text-chart-2">
                        <Icons.fileText className="size-4" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground lowercase">
                        {totals?.dataMB.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{L.mb || 'mb'}</span>
                    </p>
                    <p className="text-base text-muted-foreground font-normal lowercase">raw data</p>
                </div>
            </div>

            {/* Index Size */}
            <div className="bg-card rounded-2xl p-6 border-none shadow-none transition-all hover:bg-muted/5">
                <div className="flex justify-between items-start mb-5">
                    <p className="text-sm font-normal text-muted-foreground lowercase">{L.index || 'index'}</p>
                    <div className="size-8 rounded-xl bg-chart-3/10 flex items-center justify-center text-chart-3">
                        <Icons.list className="size-4" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground lowercase">
                        {totals?.indexMB.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{L.mb || 'mb'}</span>
                    </p>
                    <p className="text-base text-muted-foreground font-normal lowercase">indexes</p>
                </div>
            </div>

            {/* Total Rows */}
            <div className="bg-card rounded-2xl p-6 border-none shadow-none transition-all hover:bg-muted/5">
                <div className="flex justify-between items-start mb-5">
                    <p className="text-sm font-normal text-muted-foreground lowercase">{L.totalRows || 'total rows'}</p>
                    <div className="size-8 rounded-xl bg-chart-4/10 flex items-center justify-center text-chart-4">
                        <Icons.list className="size-4" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground lowercase">
                        {totalRows.toLocaleString()}
                    </p>
                    <p className="text-base text-muted-foreground font-normal lowercase">total records</p>
                </div>
            </div>
        </section>
    );
};
