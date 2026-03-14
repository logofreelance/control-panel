/**
 * settings/api/index.ts
 * 
 * Centralized API configuration for settings module
 * STANDARDIZED: Uses env.API_BASE + relative paths
 */

import { env } from '@/lib/env';

export const API = {
    settings: `${env.API_BASE}/settings`,
} as const;
