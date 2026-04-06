/**
 * feature-monitor-analytics/composables/useMonitorAnalytics.ts
 * 
 * Composable for API monitor analytics data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MODULE_LABELS } from '@/lib/config';
import { useToast, usePageLoading } from '@/modules/_core';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { MonitorAnalyticsStats, ApiResponse } from '../types';

const MSG = MODULE_LABELS.monitorAnalytics.messages;
const REFRESH_INTERVAL = 30000; // 30 seconds

export function useMonitorAnalytics() {
    const params = useParams();
    const nodeId = params?.id as string;
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [stats, setStats] = useState<MonitorAnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchStats = useCallback(async () => {
        if (!nodeId) return;
        try {
            const data = await apiClient.get<ApiResponse<MonitorAnalyticsStats>>('/monitor-analytics', {
                headers: { 'x-target-id': nodeId }
            });
            if (data.status === 'success' && data.data) {
                setStats(data.data);
            } else {
                addToast(MSG.loadFailed, 'error');
            }
        } catch {
            addToast(MSG.connectionFailed, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast, nodeId]);


    useEffect(() => {
        fetchStats();
        intervalRef.current = setInterval(fetchStats, REFRESH_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchStats]);

    // Computed values
    const total = Number(stats?.aggregates?.total || 0);
    const success = Number(stats?.aggregates?.success || 0);
    const failed = total - success;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 100;
    const avgLatency = Number(stats?.aggregates?.avg_latency || 0).toFixed(0);

    return {
        stats,
        loading,
        refresh: fetchStats,
        // Computed
        total,
        success,
        failed,
        successRate,
        avgLatency,
        recentLogs: stats?.recentLogs || [],
    };
}
