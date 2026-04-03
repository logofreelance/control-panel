/**
 * feature-monitor-analytics/composables/useMonitorAnalytics.ts
 * 
 * Composable for API monitor analytics data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MODULE_LABELS } from '@/lib/config';
import { useToast, usePageLoading } from '@/modules/_core';
import { API } from '../api';
import type { MonitorAnalyticsStats, ApiResponse } from '../types';

const MSG = MODULE_LABELS.monitorAnalytics.messages;
const REFRESH_INTERVAL = 30000; // 30 seconds

export function useMonitorAnalytics() {
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
        try {
            const res = await fetch(API.stats);
            const data: ApiResponse<MonitorAnalyticsStats> = await res.json();
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
    }, [addToast]);

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
