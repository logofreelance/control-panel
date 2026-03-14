// Storage module types
import { StorageStats, TableStat } from '@cp/storage-manager';

// Re-export package types
export type { StorageStats, TableStat };

// Alias for compatibility if needed, or prefer using StorageStats directly
export type DatabaseStorageStats = StorageStats;
export type TableStats = TableStat;

// File storage statistics from /orange/storage/files/stats (Not migrated yet fully?)
// Keeping local types for file storage
export interface FileStorageStats {
    usedSize: number;
    totalSize: number;
    filesCount: number;
    foldersCount: number;
}

// File/Folder item
export interface StorageItem {
    id: number;
    name: string;
    path: string;
    isFolder: boolean;
    size?: number;
    mimeType?: string;
    createdAt?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

// Database Health Check
export interface DbHealthCheck {
    pingMs: number;
    version: string;
    healthy: boolean;
    totalLogs: number;
    totalNodes: number;
}

// Slow Query entry from api_logs
export interface SlowQuery {
    endpoint: string;
    method: string;
    statusCode: number;
    durationMs: number;
    ip: string;
    createdAt: string;
}
