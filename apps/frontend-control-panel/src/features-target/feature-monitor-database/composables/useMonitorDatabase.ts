'use client';

/**
 * useMonitorDatabase - Composable for database monitoring
 * Fetches real database storage metrics from the connected database
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@/lib/config/client';
import { useToast, usePageLoading } from '@/modules/_core';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { MonitorDatabaseStats, ApiResponse } from '../types';

export function useMonitorDatabase() {
    const params = useParams();
    const nodeId = params?.id as string;
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [stats, setStats] = useState<MonitorDatabaseStats>({
        databaseName: '...',
        totalSizeMb: '0',
        totalRows: 0,
        totalTables: 0,
        tables: [],
        summary: {
            largestTable: { name: '-', sizeMb: '0', indexSizeMb: '0', overheadMb: '0', rows: 0 },
            mostRowsTable: { name: '-', sizeMb: '0', indexSizeMb: '0', overheadMb: '0', rows: 0 },
            indexRatio: '0',
            totalIndexSizeMb: '0'
        }
    });
    const [loading, setLoading] = useState(true);
    const [dropping, setDropping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchStats = useCallback(async () => {
        if (!nodeId) return;
        setLoading(true);
        setError(null);

        try {
            const data = await apiClient.get<ApiResponse<MonitorDatabaseStats>>('/monitor-database/stats', {
                headers: { 'x-target-id': nodeId }
            });

            if (data.status === 'success' && data.data) {
                setStats(data.data);
            } else {
                setError(data.message || 'Failed to load database stats');
                addToast(data.message || 'Failed to load database stats', 'error');
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Connection failed';
            setError(errMsg);
            addToast('Connection failed', 'error');
        }

        setLoading(false);
    }, [addToast, nodeId]);

    const dropTable = useCallback(async (tableName: string): Promise<boolean> => {
        if (!nodeId) return false;
        setDropping(true);
        try {
            const data = await apiClient.delete<ApiResponse<{ tableName: string }>>(`/monitor-database/tables/${tableName}`, {
                headers: { 'x-target-id': nodeId }
            });

            if (data.status === 'success') {
                addToast('Table deleted successfully', 'success');
                await fetchStats();
                return true;
            } else {
                addToast(data.message || 'Delete failed', 'error');
                return false;
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Delete failed';
            addToast(errMsg, 'error');
            return false;
        } finally {
            setDropping(false);
        }
    }, [addToast, fetchStats, nodeId]);

    const cleanupOrphaned = useCallback(async (): Promise<{ orphanedDataSources: number; orphanedResources: number; invalidRelations: number; details: string[] } | null> => {
        if (!nodeId) return null;
        try {
            const data = await apiClient.post<ApiResponse<{
                orphanedDataSources: number;
                orphanedResources: number;
                invalidRelations: number;
                details: string[];
            }>>('/monitor-database/cleanup', {}, {
                headers: { 'x-target-id': nodeId }
            });

            if (data.status === 'success' && data.data) {
                const total = data.data.orphanedDataSources + data.data.orphanedResources + data.data.invalidRelations;
                if (total > 0) {
                    addToast(`Cleaned ${total} orphaned items`, 'success');
                    await fetchStats();
                } else {
                    addToast('Database is clean', 'success');
                }
                return data.data;
            } else {
                addToast(data.message || 'Cleanup failed', 'error');
                return null;
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Cleanup failed';
            addToast(errMsg, 'error');
            return null;
        }
    }, [addToast, fetchStats, nodeId]);


    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        dropping,
        error,
        refresh: fetchStats,
        dropTable,
        cleanupOrphaned,
    };
}
