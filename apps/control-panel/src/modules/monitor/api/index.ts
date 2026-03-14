/**
 * monitor/api/index.ts
 * 
 * Centralized API configuration for monitor module
 * STANDARDIZED: Uses env.API_BASE + relative paths
 */

import { env } from '@/lib/env';

export const API = {
    stats: `${env.API_BASE}/monitor`,
    traffic: `${env.API_BASE}/analytics/traffic`,
    topEndpoints: `${env.API_BASE}/analytics/top-endpoints`,
    errorDistribution: `${env.API_BASE}/analytics/error-distribution`,
    nodesHealth: `${env.API_BASE}/nodes-health`,
} as const;
