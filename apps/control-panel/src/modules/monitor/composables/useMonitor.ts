/**
 * monitor/composables/useMonitor.ts
 * 
 * Composable for API monitoring data (System Observability)
 * Fetches: stats, traffic, top endpoints, error distribution, cluster nodes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MODULE_LABELS } from '@cp/config';
import { useToast, usePageLoading } from '@/modules/_core';
import { API } from '../api';
import type { MonitorStats, ApiResponse, DailyTraffic, TopEndpoint, ErrorDistribution, NodeHealth } from '../types';

const MSG = MODULE_LABELS.monitor.messages;
const REFRESH_INTERVAL = 30000; // 30 seconds

export function useMonitor() {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [stats, setStats] = useState<MonitorStats | null>(null);
    const [traffic, setTraffic] = useState<DailyTraffic[]>([]);
    const [topEndpoints, setTopEndpoints] = useState<TopEndpoint[]>([]);
    const [errorDistribution, setErrorDistribution] = useState<ErrorDistribution[]>([]);
    const [clusterNodes, setClusterNodes] = useState<NodeHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchStats = useCallback(async () => {
        try {
            const [statsRes, trafficRes, topRes, errDistRes, nodesRes] = await Promise.all([
                fetch(API.stats),
                fetch(API.traffic),
                fetch(API.topEndpoints),
                fetch(API.errorDistribution),
                fetch(API.nodesHealth),
            ]);
            
            const [statsData, trafficData, topData, errDistData, nodesData] = await Promise.all([
                statsRes.json() as Promise<ApiResponse<MonitorStats>>,
                trafficRes.json() as Promise<ApiResponse<DailyTraffic[]>>,
                topRes.json() as Promise<ApiResponse<TopEndpoint[]>>,
                errDistRes.json() as Promise<ApiResponse<ErrorDistribution[]>>,
                nodesRes.json() as Promise<ApiResponse<NodeHealth[]>>,
            ]);

            if (statsData.status === 'success' && statsData.data) {
                setStats(statsData.data);
            } else {
                addToast(MSG.loadFailed, 'error');
            }

            if (trafficData.status === 'success' && trafficData.data) {
                setTraffic(trafficData.data);
            }
            if (topData.status === 'success' && topData.data) {
                setTopEndpoints(topData.data);
            }
            if (errDistData.status === 'success' && errDistData.data) {
                setErrorDistribution(errDistData.data);
            }
            if (nodesData.status === 'success' && nodesData.data) {
                setClusterNodes(nodesData.data);
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
        traffic,
        topEndpoints,
        errorDistribution,
        clusterNodes,
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
