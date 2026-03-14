/**
 * packages/storage/src/service.ts
 * 
 * Storage Service - Business Logic
 */

import { STORAGE_LABELS } from './config/labels';
import { STORAGE_SYSTEM } from './config/constants';
import { StorageStats } from './types';
import { IStorageRepository } from './types/repository';

export class StorageService {
    constructor(private repo: IStorageRepository) { }

    /**
     * Get Database Storage Statistics via Information Schema
     */
    async getStats(dbName: string): Promise<StorageStats> {
        return this.repo.getStats(dbName);
    }

    /**
     * Drop a database table and cleanup metadata
     */
    async dropTable(dbName: string, tableName: string): Promise<boolean> {
        return this.repo.dropTable(dbName, tableName);
    }

    /**
     * Cleanup orphaned data (sources, resources, relations)
     */
    async cleanupOrphaned(dbName: string): Promise<{ orphanedDataSources: number; orphanedResources: number; invalidRelations: number; details: string[] }> {
        return this.repo.cleanupOrphaned(dbName);
    }
}
