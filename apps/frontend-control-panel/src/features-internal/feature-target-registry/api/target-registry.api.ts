/**
 * feature-target-registry — API Layer
 * 
 * 🤖 AI: All HTTP calls for the Target Registry feature.
 * "target system" = external system managed by this Control Panel.
 */

import { apiClient } from '@/lib/api-client';
import type { TargetSystem, CreateTargetInput, UpdateTargetInput, HealthCheckResult } from '../types/target-registry.types';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: { code: string; message: string };
}

interface TestConnectionResult {
    ok: boolean;
    latencyMs: number;
    error?: string;
}

export const targetRegistryApi = {
    list: (): Promise<ApiResponse<TargetSystem[]>> =>
        apiClient.get('/target-systems'),

    create: (data: CreateTargetInput): Promise<ApiResponse<TargetSystem>> =>
        apiClient.post('/target-systems', data),

    update: (id: string, data: UpdateTargetInput): Promise<ApiResponse<TargetSystem>> =>
        apiClient.put(`/target-systems/${id}`, data),

    remove: (id: string): Promise<ApiResponse<null>> =>
        apiClient.delete(`/target-systems/${id}`),

    testConnection: (databaseUrl: string): Promise<ApiResponse<TestConnectionResult>> =>
        apiClient.post('/target-systems/test-connection', { databaseUrl }),

    /** Run a full health check: test connection + count active routes in target DB */
    healthCheck: (id: string): Promise<ApiResponse<HealthCheckResult>> =>
        apiClient.post(`/target-systems/${id}/health`, {}),
};
