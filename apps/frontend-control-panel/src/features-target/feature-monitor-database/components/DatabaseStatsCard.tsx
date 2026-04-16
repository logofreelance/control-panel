'use client';

/**
 * DatabaseStatsCard - Shows database storage statistics
 * Refactored to match standard dashboard design (Flat UI)
 */

import { useMemo } from 'react';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { Card, CardContent } from '@/components/ui';
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
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Storage */}
            <Card>
                <CardContent>
                    <div className="flex justify-between items-start mb-6">
                        <p className="text-base font-normal text-muted-foreground lowercase">{L.databaseStorage || 'storage'}</p>
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                            <Icons.database className="size-5" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-4xl font-semibold text-foreground lowercase leading-none">
                            {totalStorageMB} <span className="text-base font-normal text-muted-foreground">{L.mb || 'mb'}</span>
                        </p>
                        <p className="text-base text-primary font-normal truncate lowercase">{stats.databaseName}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Data Size */}
            <Card>
                <CardContent>
                    <div className="flex justify-between items-start mb-6">
                        <p className="text-base font-normal text-muted-foreground lowercase">{L.data || 'data'}</p>
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                            <Icons.fileText className="size-5" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-4xl font-semibold text-foreground lowercase leading-none">
                            {totals?.dataMB.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{L.mb || 'mb'}</span>
                        </p>
                        <p className="text-base text-muted-foreground font-normal lowercase">raw data</p>
                    </div>
                </CardContent>
            </Card>

            {/* Index Size */}
            <Card>
                <CardContent>
                    <div className="flex justify-between items-start mb-6">
                        <p className="text-base font-normal text-muted-foreground lowercase">{L.index || 'index'}</p>
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                            <Icons.list className="size-5" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-4xl font-semibold text-foreground lowercase leading-none">
                            {totals?.indexMB.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{L.mb || 'mb'}</span>
                        </p>
                        <p className="text-base text-muted-foreground font-normal lowercase">indexes</p>
                    </div>
                </CardContent>
            </Card>

            {/* Total Rows */}
            <Card>
                <CardContent>
                    <div className="flex justify-between items-start mb-6">
                        <p className="text-base font-normal text-muted-foreground lowercase">{L.totalRows || 'total rows'}</p>
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                            <Icons.list className="size-5" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-4xl font-semibold text-foreground lowercase leading-none">
                            {totalRows.toLocaleString()}
                        </p>
                        <p className="text-base text-muted-foreground font-normal lowercase">total records</p>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};

