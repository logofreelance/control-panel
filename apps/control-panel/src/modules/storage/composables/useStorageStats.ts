'use client';

/**
 * useStorageStats - Composable for database storage statistics
 * Fetches real database storage metrics from the connected database
 * PURE DI: Uses MODULE_LABELS from @cp/config/client and API from local api/
 */

import { useState, useEffect, useCallback } from 'react';
import { MODULE_LABELS } from '@cp/config/client';
import { useToast, usePageLoading } from '@/modules/_core';
import { API } from '../api';
import type { StorageStats, ApiResponse, DbHealthCheck, SlowQuery } from '../types';
import { fetchWithCsrf } from '@/lib/csrf';

const MSG = MODULE_LABELS.storage.messages;

export function useStorageStats() {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [stats, setStats] = useState<StorageStats>({
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
    const [healthCheck, setHealthCheck] = useState<DbHealthCheck | null>(null);
    const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [statsRes, healthRes, sqRes] = await Promise.all([
                fetch(API.stats),
                fetch(API.healthCheck).catch(() => null),
                fetch(API.slowQueries).catch(() => null),
            ]);

            const statsData: ApiResponse<StorageStats> = await statsRes.json();
            if (statsData.status === 'success' && statsData.data) {
                setStats(statsData.data);
            } else {
                setError(statsData.message || MSG.loadFailed);
                addToast(MSG.loadFailed, 'error');
            }

            if (healthRes) {
                const hData: ApiResponse<DbHealthCheck> = await healthRes.json();
                if (hData.status === 'success' && hData.data) setHealthCheck(hData.data);
            }
            if (sqRes) {
                const sqData: ApiResponse<SlowQuery[]> = await sqRes.json();
                if (sqData.status === 'success' && sqData.data) setSlowQueries(sqData.data);
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : MSG.connectionFailed;
            setError(errMsg);
            addToast(MSG.connectionFailed, 'error');
        }

        setLoading(false);
    }, [addToast]);

    const dropTable = useCallback(async (tableName: string): Promise<boolean> => {
        setDropping(true);
        try {
            const res = await fetchWithCsrf(API.dropTable(tableName), {
                method: 'DELETE',
            });
            const data: ApiResponse<{ tableName: string }> = await res.json();

            if (data.status === 'success') {
                addToast(MSG.tableDeleted, 'success');
                // Refresh stats after deletion
                await fetchStats();
                return true;
            } else {
                addToast(data.message || MSG.deleteFailed, 'error');
                return false;
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : MSG.deleteFailed;
            addToast(errMsg, 'error');
            return false;
        } finally {
            setDropping(false);
        }
    }, [addToast, fetchStats]);

    const cleanupOrphaned = useCallback(async (): Promise<{ orphanedDataSources: number; orphanedResources: number; invalidRelations: number; details: string[] } | null> => {
        try {
            const res = await fetchWithCsrf(API.cleanup, { method: 'POST' });
            const data: ApiResponse<{
                orphanedDataSources: number;
                orphanedResources: number;
                invalidRelations: number;
                details: string[];
            }> = await res.json();

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
    }, [addToast, fetchStats]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        healthCheck,
        slowQueries,
        loading,
        dropping,
        error,
        refresh: fetchStats,
        dropTable,
        cleanupOrphaned,
    };
}
