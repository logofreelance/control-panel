/**
 * database-schema/composables/usedatabaseSchematats.ts
 *
 * Hook to fetch aggregated stats for data sources from the server.
 * Replaces client-side aggregation logic.
 *
 * ✅ PURE DI: Uses useConfig() hook for API and labels
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/frontend-api';
import { API } from '../api/endpoints';

interface SchemaStats {
    totalSources: number;
    totalTables: number;
    totalRecords: number;
}

/**
 * Hook to fetch aggregated stats for data sources from the server.
 * Modularized: Uses internal API.
 */
export function useSchemaStats() {
    const [stats, setStats] = useState<SchemaStats>({
        totalSources: 0,
        totalTables: 0,
        totalRecords: 0
    });
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const targetId = rawNodeId;

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const headers = targetId ? { 'x-target-id': targetId } : undefined;
            // ✅ Use Internal API or fallback to standard path
            const statsUrl = (API as any).stats || `${API.list}/stats`;
            const response = await apiClient.get<SchemaStats>(statsUrl, { headers });
            
            if (response?.status === 'success' && response?.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch database schema stats', error);
        } finally {
            setLoading(false);
        }
    }, [targetId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        refetch: fetchStats
    };
}
