/**
 * storage/api/index.ts
 * 
 * Centralized API configuration for storage module
 * STANDARDIZED: Uses env.API_BASE + relative paths
 */

import { env } from '@/lib/env';

// Use relative paths without /orange prefix since env.API_BASE already includes it
export const API = {
    stats: `${env.API_BASE}/storage/stats`,
    fileStats: `${env.API_BASE}/storage/files/stats`,
    files: `${env.API_BASE}/storage/files`,
    upload: `${env.API_BASE}/storage/files/upload`,
    folders: `${env.API_BASE}/storage/folders`,
    download: (id: number) => `${env.API_BASE}/storage/files/${id}/download`,
    deleteFile: (id: number) => `${env.API_BASE}/storage/files/${id}`,
    dropTable: (name: string) => `${env.API_BASE}/storage/tables/${name}`,
    cleanup: `${env.API_BASE}/storage/cleanup`,
    healthCheck: `${env.API_BASE}/storage/health-check`,
    slowQueries: `${env.API_BASE}/storage/slow-queries`,
} as const;
