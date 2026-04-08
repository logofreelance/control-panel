/**
 * feature-target-registry — TypeScript Interfaces
 * 
 * 🤖 AI: "TargetSystem" = an external system registered in and managed by this Control Panel.
 */

export type TargetSystemStatus = 'online' | 'offline' | 'unknown' | 'error';

export interface TargetSystem {
    id: string;
    name: string;
    description: string;
    apiEndpoint: string | null;
    databaseUrl?: string;        // optional: hanya ada di detail/edit response (masked)
    status: TargetSystemStatus;
    routeCount: number;
    lastHealthCheck: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTargetInput {
    name: string;
    description?: string;
    apiEndpoint?: string;
    databaseUrl: string;
}

export interface UpdateTargetInput {
    name?: string;
    description?: string;
    apiEndpoint?: string;
    databaseUrl?: string;
}

export interface HealthCheckResult {
    ok: boolean;
    latencyMs: number;
    routeCount: number;
    status: TargetSystemStatus;
    error?: string;
}
