/**
 * roles/api/index.ts
 * 
 * Centralized API configuration for roles module
 * STANDARDIZED: Uses env.API_BASE + relative paths
 */

import { env } from '@/lib/env';

export const API = {
    list: `${env.API_BASE}/roles`,
    permissions: `${env.API_BASE}/permissions`,
} as const;
