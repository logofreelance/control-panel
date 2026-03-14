/**
 * monitor/types/index.ts
 * 
 * TypeScript interfaces for monitor module
 */

export interface MonitorAggregates {
    total: number;
    success: number;
    avg_latency: number;
}

export interface ApiLog {
    id: number;
    apiKeyId?: number;
    method: string;
    endpoint: string;
    statusCode: number;
    durationMs: number;
    origin?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    createdAt: string;
}

export interface MonitorStats {
    aggregates: MonitorAggregates;
    recentLogs: ApiLog[];
}

export interface DailyTraffic {
    date: string;
    total: number;
    avgLatency: number;
}

export interface TopEndpoint {
    endpoint: string;
    method: string;
    totalHits: number;
    avgLatency: number;
    successCount: number;
    errorCount: number;
}

export interface ErrorDistribution {
    category: string;
    count: number;
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

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
