/**
 * feature-target-registry — TypeScript Interfaces
 * 
 * 🤖 AI: "TargetSystem" = an external system registered in and managed by this Control Panel.
 */

import type { TargetSystemStatus } from './target-registry.config';

/** Database row from `target_systems` table */
export interface TargetSystemRow {
    id: string;
    name: string;
    description: string;
    api_endpoint: string | null;
    database_url: string;
    status: string;
    route_count: number;
    last_health_check: string | null;
    created_at: string;
    updated_at: string;
}

/** Parsed target system object used by handlers and frontend */
export interface TargetSystem {
    id: string;
    name: string;
    description: string;
    apiEndpoint: string | null;
    databaseUrl: string;
    status: TargetSystemStatus;
    routeCount: number;
    lastHealthCheck: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Input for creating a new target system */
export interface CreateTargetInput {
    name: string;
    description?: string;
    apiEndpoint?: string;
    databaseUrl: string;
}

/** Input for updating an existing target system */
export interface UpdateTargetInput {
    name?: string;
    description?: string;
    apiEndpoint?: string;
    databaseUrl?: string;
}

/** Result of a health check operation */
export interface HealthCheckResult {
    ok: boolean;
    latencyMs: number;
    routeCount: number;
    status: TargetSystemStatus;
    error?: string;
}
