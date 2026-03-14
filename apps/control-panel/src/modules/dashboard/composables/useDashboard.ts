'use client';

import { useState, useEffect } from 'react';
import { env } from '@/lib/env';
import { useToast, usePageLoading } from '@/modules/_core';
import { MODULE_LABELS } from '@cp/config';

const L = MODULE_LABELS.dashboard;

interface Log {
    id: number;
    statusCode: number;
    method: string;
    endpoint: string;
    createdAt: string;
    durationMs: number;
}

export interface NodeHealth {
    nodeId: string;
    endpointUrl: string;
    cpuUsage: string;
    memoryUsage: string;
    uptime: number;
    status: 'online' | 'offline';
    lastHeartbeat: string;
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
    const [nodes, setNodes] = useState<NodeHealth[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats, users, storage, and new nodes-health concurrently
                const [mRes, uRes, sRes, nRes] = await Promise.all([
                    fetch(`${env.API_BASE}/monitor`),
                    fetch(`${env.API_BASE}/users`),
                    fetch(`${env.API_BASE}/storage/stats`),
                    fetch(`${env.API_BASE}/nodes-health`)
                ]);
                const [mData, uData, sData, nData] = await Promise.all([
                    mRes.json(), 
                    uRes.json(), 
                    sRes.json(),
                    nRes.json()
                ]);

                if (mData.status === 'success') {
                    setStats({
                        ...mData.data,
                        totalUsers: uData.data?.length || 0,
                        storageMB: sData.data ? (sData.data.usedSize / 1024 / 1024).toFixed(1) : 0,
                        activeEndpoints: mData.data.activeEndpoints || 0,
                        activeKeys: mData.data.activeKeys || 0
                    });
                }

                if (nData.status === 'success' && Array.isArray(nData.data)) {
                    setNodes(nData.data);
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
            setLoading(false);
        };
        fetchDashboardData();
        
        // Polling nodes health every 10 seconds for real-time vibe
        const pollTimer = setInterval(async () => {
            try {
                const res = await fetch(`${env.API_BASE}/nodes-health`);
                const data = await res.json();
                if (data.status === 'success' && Array.isArray(data.data)) {
                    setNodes(data.data);
                }
            } catch {
                // Ignore silent polling errors
            }
        }, 10000);

        return () => clearInterval(pollTimer);
    }, []);

    // Use the first online node as gateway, otherwise fallback to configured API
    const activeNode = Array.isArray(nodes) ? nodes.find(n => n.status === 'online') : null;
    const gatewayBaseUrl = activeNode ? activeNode.endpointUrl : env.BACKEND_SYSTEM_API;
    const gatewayPath = `${gatewayBaseUrl}/data`;

    const copyGatewayUrl = () => {
        navigator.clipboard.writeText(gatewayPath);
        addToast(L.labels.copied, 'success');
    };

    return {
        stats,
        nodes,
        loading,
        copyGatewayUrl,
        gatewayUrl: gatewayPath
    };
}

