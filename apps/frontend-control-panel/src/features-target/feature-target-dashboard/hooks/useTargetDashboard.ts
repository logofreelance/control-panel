'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTargetRegistry } from '@/features-internal/feature-target-registry';
import { timeAgo } from '../services/target-detail-utils';
import { TARGET_DASHBOARD_LABELS } from '../constants/ui-labels';
import type { TargetSystem } from '@/features-internal/feature-target-registry';

export function useTargetDashboard(targetId: string) {
    const { targets, loading, checkHealth } = useTargetRegistry();
    const [checkingHealth, setCheckingHealth] = useState(false);

    const target = useMemo(
        () => targets.find(t => t.id === targetId),
        [targets, targetId]
    );

    useEffect(() => {
        if (targetId) {
            localStorage.setItem('lastTargetId', targetId);
        }
    }, [targetId]);

    const handleCheckHealth = useCallback(async () => {
        setCheckingHealth(true);
        await checkHealth(targetId);
        setCheckingHealth(false);
    }, [checkHealth, targetId]);

    const isOnline = target?.status === 'online';

    const metrics = useMemo(() => {
        if (!target) return [];
        return [
            { key: 'activeRoutes', label: TARGET_DASHBOARD_LABELS.metrics.activeRoutes, value: String(target.routeCount) },
            { key: 'heartbeat', label: TARGET_DASHBOARD_LABELS.metrics.heartbeat, value: timeAgo(target.lastHealthCheck) },
            { key: 'latency', label: TARGET_DASHBOARD_LABELS.metrics.latency, value: '14ms' },
            { key: 'uptime', label: TARGET_DASHBOARD_LABELS.metrics.uptime, value: '100%' },
        ];
    }, [target]);

    return {
        target,
        loading,
        checkingHealth,
        isOnline,
        metrics,
        handleCheckHealth,
    };
}
