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
import { apiClient } from '@/lib/frontend-api';
import { useConfig } from '@/modules/_core';

interface SchemaStats {
    total_sources: number;
    total_tables: number;
    total_records: number;
}

export function useSchemaStats() {
    // ✅ Pure DI: Get all dependencies from context
    const { api } = useConfig();

    const [stats, setStats] = useState<SchemaStats>({
        total_sources: 0,
        total_tables: 0,
        total_records: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await apiClient.get<SchemaStats>((api.databaseSchema as any).stats || `${api.databaseSchema.list}/stats`);
            if (response?.status === 'success' && response?.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch database schema stats', error);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        refetch: fetchStats
    };
}
