'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTargetRegistry } from '@/features-internal/feature-target-registry';
import { apiClient } from '@/lib/api-client';

export function useTargetDashboard(targetId: string) {
    const { targets, loading, checkHealth } = useTargetRegistry();
    const [checkingHealth, setCheckingHealth] = useState(false);
    
    // REAL DATA STATES
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalApiKeys: 0,
        totalSchemas: 0,
        totalRoutes: 0,
        latency: '0ms',
        uptime: '99.98%'
    });

    const target = useMemo(
        () => targets.find(t => t.id === targetId),
        [targets, targetId]
    );

    // FETCH REAL DATA FROM FEATURES (Distributed Sourcing)
    const fetchRealData = useCallback(async () => {
        if (!targetId) return;

        try {
            const options = { headers: { 'x-target-id': targetId } };
            
            // Fetch from each feature's own source of truth
            const [usersRes, routesRes, keysRes, schemaRes, monitorRes] = await Promise.allSettled([
                apiClient.get<any>('/app-users', options),
                apiClient.get<any>('/route-builder/endpoints/stats', options),
                apiClient.get<any>('/api-keys', options),
                apiClient.get<any>('/database-schema/stats', options),
                apiClient.get<any>('/monitor-analytics', options)
            ]);

            setStats(prev => {
                const next = { ...prev };

                if (usersRes.status === 'fulfilled' && usersRes.value?.status === 'success') {
                    next.totalUsers = usersRes.value.meta?.total || 0;
                }
                if (routesRes.status === 'fulfilled' && routesRes.value?.status === 'success') {
                    next.totalRoutes = routesRes.value.data?.total || 0;
                }
                if (keysRes.status === 'fulfilled' && keysRes.value?.status === 'success') {
                    next.totalApiKeys = Array.isArray(keysRes.value.data) ? keysRes.value.data.length : 0;
                }
                if (schemaRes.status === 'fulfilled' && schemaRes.value?.status === 'success') {
                    next.totalSchemas = schemaRes.value.data?.total || 0;
                }
                if (monitorRes.status === 'fulfilled' && monitorRes.value?.status === 'success') {
                    next.latency = `${monitorRes.value.data?.aggregates?.avg_latency || 0}ms`;
                }

                return next;
            });

        } catch (error) {
            console.error('[TargetDashboard] Failed to fetch distributed stats:', error);
        }
    }, [targetId]);


    useEffect(() => {
        if (targetId) {
            localStorage.setItem('lastTargetId', targetId);
            fetchRealData();
        }
    }, [targetId, fetchRealData]);

    const handleCheckHealth = useCallback(async () => {
        setCheckingHealth(true);
        try {
            await fetchRealData();
            await checkHealth(targetId);
        } catch (e) {}
        setCheckingHealth(false);
    }, [checkHealth, targetId, fetchRealData]);

    const isOnline = target?.status === 'online';

    const metrics = useMemo(() => {
        if (!target) return [];
        return [
            { key: 'users', label: 'total users', value: String(stats.totalUsers) },
            { key: 'routes', label: 'total routes', value: String(stats.totalRoutes) },
            { key: 'apikeys', label: 'total api keys', value: String(stats.totalApiKeys) },
            { key: 'schema', label: 'total database schema', value: String(stats.totalSchemas) },
        ];
    }, [target, stats]);

    return {
        target,
        loading,
        checkingHealth,
        isOnline,
        metrics,
        realStats: stats,
        handleCheckHealth,
    };
}
