/**
 * feature-monitor-analytics/api/index.ts
 * 
 * Centralized API configuration for monitor analytics feature
 */

import { env } from '@/lib/env';

export const API = {
    stats: `${env.API_URL}/monitor-analytics`,
} as const;
