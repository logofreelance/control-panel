/**
 * feature-monitor-analytics/types/index.ts
 * 
 * TypeScript interfaces for monitor analytics feature
 */

export interface MonitorAnalyticsAggregates {
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

export interface MonitorAnalyticsStats {
    aggregates: MonitorAnalyticsAggregates;
    recentLogs: ApiLog[];
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
