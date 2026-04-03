'use client';

/**
 * MonitorDatabaseView - Main UI for database monitoring
 * Features:
 * - Real-time database stats aggregates
 * - Table listing with size and row counts
 * - Table management (Drop table)
 * - Metadata cleanup
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useMonitorDatabase } from '../composables/useMonitorDatabase';
import { DatabaseStatsCard } from './DatabaseStatsCard';
import { MonitorTablesList } from './MonitorTablesList';

const L = MODULE_LABELS.monitorDatabase?.labels || {};
const BTN = MODULE_LABELS.monitorDatabase?.buttons || {};

export const MonitorDatabaseView = () => {
    const { 
        stats, 
        loading, 
        dropping, 
        refresh, 
        dropTable, 
        cleanupOrphaned 
    } = useMonitorDatabase();
    
    const [isCleaning, setIsCleaning] = useState(false);

    const handleCleanup = async () => {
        setIsCleaning(true);
        await cleanupOrphaned();
        setIsCleaning(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {MODULE_LABELS.monitorDatabase?.title || 'Monitor Database'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {MODULE_LABELS.monitorDatabase?.subtitle || 'Real-time database storage metrics and management'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={refresh}
                        disabled={loading}
                    >
                        <Icons.refresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {BTN.refresh || 'Refresh'}
                    </Button>
                    <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleCleanup}
                        isLoading={isCleaning}
                        disabled={loading}
                    >
                        <Icons.sparkles className="w-4 h-4 mr-2" />
                        {BTN.cleanup || 'Cleanup'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <DatabaseStatsCard stats={stats} loading={loading} />

            {/* Tables List */}
            <MonitorTablesList 
                tables={stats.tables} 
                loading={loading}
                dropping={dropping}
                onDelete={dropTable}
            />
        </div>
    );
};
