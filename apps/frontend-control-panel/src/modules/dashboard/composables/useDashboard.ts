'use client';

import { useState, useEffect } from 'react';
import { env } from '@/lib/env';
import { useToast, usePageLoading } from '@/modules/_core';
import { MODULE_LABELS } from '@/lib/config';

const L = MODULE_LABELS.dashboard;

interface Log {
    id: number;
    statusCode: number;
    method: string;
    endpoint: string;
    createdAt: string;
    durationMs: number;
}

interface DashboardStats {
    activeEndpoints: number;
    activeKeys: number;
    totalUsers: number;
    totalRequests: number;
    successRate: number;
    storageMB: string | number;
    recentLogs: Log[];
}

export function useDashboard() {
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    useEffect(() => {
        // TODO: Re-enable once monitor/users/storage endpoints are migrated
        // const fetchDashboardData = async () => { ... };
        // fetchDashboardData();
        setLoading(false);
    }, []);

    const copyGatewayUrl = () => {
        navigator.clipboard.writeText(`${env.API_URL}/data`);
        addToast(L.labels.copied, 'success');
    };

    return {
        stats,
        loading,
        copyGatewayUrl,
        gatewayUrl: `${env.API_URL}/data`
    };
}
