/**
 * feature-monitor-database/api/index.ts
 */
import { env } from '@/lib/env';

export const API = {
    stats: `${env.API_URL}/monitor-database/stats`,
    dropTable: (name: string) => `${env.API_URL}/monitor-database/tables/${name}`,
    cleanup: `${env.API_URL}/monitor-database/cleanup`,
} as const;
